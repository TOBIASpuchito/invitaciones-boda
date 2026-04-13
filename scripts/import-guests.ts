import process from 'node:process'

import { Pool } from 'pg'
import XLSX from 'xlsx'

import { normalizeText, slugifyText } from '../server/utils/text'

type SheetRow = Record<string, unknown>

function getEnv(name: string) {
  return process.env[name]?.trim() ?? ''
}

function getSupabaseUrl() {
  return getEnv('NUXT_SUPABASE_URL') || getEnv('SUPABASE_URL')
}

function getDatabasePassword() {
  return getEnv('NUXT_SUPABASE_DB_PASSWORD')
}

function buildConnectionString(supabaseUrl: string, databasePassword: string) {
  const hostname = new URL(supabaseUrl).hostname
  const projectRef = hostname.split('.')[0]

  if (!projectRef) {
    throw new Error('No se pudo inferir el project ref de Supabase desde SUPABASE_URL.')
  }

  return `postgresql://postgres:${encodeURIComponent(databasePassword)}@db.${projectRef}.supabase.co:5432/postgres`
}

function normalizeHeader(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, ' ').trim()
}

function findHeaderRowIndex(rows: unknown[][]) {
  return rows.findIndex((row) => row.some((cell) => normalizeHeader(String(cell ?? '')) === 'nombre'))
}

function getCellValue(row: SheetRow, headerCandidates: string[]) {
  const normalizedCandidates = headerCandidates.map(normalizeHeader)

  for (const [key, value] of Object.entries(row)) {
    if (normalizedCandidates.includes(normalizeHeader(key))) {
      return String(value ?? '').trim()
    }
  }

  return ''
}

function getNumericCellValue(row: SheetRow, headerCandidates: string[]) {
  const rawValue = getCellValue(row, headerCandidates)
  const parsedValue = Number(rawValue)

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0
}

function isTruthyFlag(value: string) {
  const normalizedValue = normalizeText(value)

  return ['si', 'sí', 'yes', 'true', '1', 'x'].includes(normalizedValue)
}

function inferBaseAllowedGuests(displayName: string) {
  const normalizedName = normalizeText(displayName)

  if (displayName.includes('&') || normalizedName.includes(' y ') || normalizedName.includes(' e ')) {
    return 2
  }

  return 1
}

function splitNamedGuests(displayName: string, allowedGuests: number) {
  if (allowedGuests <= 1) {
    return [displayName.replace(/\s+/g, ' ').trim()]
  }

  const guests = displayName
    .split(/\s+(?:y|e)\s+|\s*&\s*/i)
    .map((guest) => guest.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return guests.length > 1 ? guests : [displayName.replace(/\s+/g, ' ').trim()]
}

function buildUniqueToken(displayName: string, usedTokens: Set<string>) {
  const baseToken = slugifyText(displayName) || 'invitado'
  let token = baseToken
  let suffix = 2

  while (usedTokens.has(token)) {
    token = `${baseToken}-${suffix}`
    suffix += 1
  }

  usedTokens.add(token)

  return token
}

async function main() {
  const workbookPath = process.argv[2] || 'C:\\Users\\tobia\\Downloads\\INVITADOS EXCEL CARLITOS.xlsx'
  const supabaseUrl = getSupabaseUrl()
  const databasePassword = getDatabasePassword()

  if (!supabaseUrl || !databasePassword) {
    throw new Error('Faltan SUPABASE_URL/NUXT_SUPABASE_URL o NUXT_SUPABASE_DB_PASSWORD en el entorno.')
  }

  const workbook = XLSX.readFile(workbookPath)
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

  if (!firstSheet) {
    throw new Error('El archivo Excel no contiene hojas legibles.')
  }

  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '' })
  const headerRowIndex = findHeaderRowIndex(rawRows)

  if (headerRowIndex < 0) {
    throw new Error('No encontramos la fila de encabezados en el Excel.')
  }

  const rows = XLSX.utils.sheet_to_json<SheetRow>(firstSheet, {
    range: headerRowIndex,
    defval: '',
  })
  const usedTokens = new Set<string>()
  const invitations = rows
    .map((row) => {
      const displayName = getCellValue(row, ['nombre'])
      const relationship = getCellValue(row, ['parentesco'])
      const quantity = getNumericCellValue(row, ['cantidad'])
      const canBringKids = getCellValue(row, ['puede traer niños', 'puede traer ninos', 'puede traer ninios'])

      if (!displayName) {
        return null
      }

      const inferredSlots = inferBaseAllowedGuests(displayName)
      const allowKids = isTruthyFlag(canBringKids)
      const allowedGuests = quantity || (allowKids ? Math.max(inferredSlots, 4) : inferredSlots)
      const namedGuests = splitNamedGuests(displayName, allowedGuests)
      const notes = allowKids ? 'Puede traer ninos.' : null

      return {
        token: buildUniqueToken(displayName, usedTokens),
        display_name: displayName,
        named_guests: namedGuests,
        search_name: normalizeText([displayName, relationship, ...namedGuests].join(' ')),
        relationship,
        allowed_guests: allowedGuests,
        notes,
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  if (!invitations.length) {
    throw new Error('No se encontraron invitados validos en el Excel.')
  }

  const pool = new Pool({
    connectionString: buildConnectionString(supabaseUrl, databasePassword),
    max: 2,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  const connection = await pool.connect()

  try {
    await connection.query('begin')

    for (const invitation of invitations) {
      await connection.query(
        `
          insert into public.invitations (
            token,
            display_name,
            named_guests,
            search_name,
            relationship,
            allowed_guests,
            notes
          )
          values ($1, $2, $3::text[], $4, $5, $6, $7)
          on conflict (token)
          do update set
            display_name = excluded.display_name,
            named_guests = excluded.named_guests,
            search_name = excluded.search_name,
            relationship = excluded.relationship,
            allowed_guests = excluded.allowed_guests,
            notes = excluded.notes,
            updated_at = now()
        `,
        [
          invitation.token,
          invitation.display_name,
          invitation.named_guests,
          invitation.search_name,
          invitation.relationship,
          invitation.allowed_guests,
          invitation.notes,
        ],
      )
    }

    await connection.query('commit')
    console.log(`Importacion completada: ${invitations.length} invitados procesados.`)
  } catch (error) {
    await connection.query('rollback')
    throw error
  } finally {
    connection.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})