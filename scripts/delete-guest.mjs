import process from 'node:process'

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const { Pool } = pg

function getEnv(name) {
  return process.env[name]?.trim() ?? ''
}

function getSupabaseUrl() {
  return getEnv('NUXT_SUPABASE_URL') || getEnv('SUPABASE_URL')
}

function getServiceRoleKey() {
  return getEnv('NUXT_SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY')
}

function getDatabasePassword() {
  return getEnv('NUXT_SUPABASE_DB_PASSWORD')
}

function buildConnectionString(supabaseUrl, databasePassword) {
  const hostname = new URL(supabaseUrl).hostname
  const projectRef = hostname.split('.')[0]

  if (!projectRef) {
    throw new Error('No se pudo inferir el project ref de Supabase desde SUPABASE_URL.')
  }

  return `postgresql://postgres:${encodeURIComponent(databasePassword)}@db.${projectRef}.supabase.co:5432/postgres`
}

function parseArgs(argv) {
  const args = new Map()

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]
    const next = argv[index + 1]

    if (!current?.startsWith('--') || !next || next.startsWith('--')) {
      continue
    }

    args.set(current, next)
    index += 1
  }

  return {
    token: args.get('--token')?.trim() ?? '',
    id: args.get('--id')?.trim() ?? '',
  }
}

async function deleteWithDatabase(supabaseUrl, databasePassword, field, value) {
  const pool = new Pool({
    connectionString: buildConnectionString(supabaseUrl, databasePassword),
    max: 2,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  const connection = await pool.connect()

  try {
    const { rows } = await connection.query(
      `
        delete from public.invitations
        where ${field} = $1
        returning id, token, display_name
      `,
      [value],
    )

    return rows[0] ?? null
  } finally {
    connection.release()
    await pool.end()
  }
}

async function deleteWithSupabase(supabaseUrl, serviceRoleKey, field, value) {
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await client
    .from('invitations')
    .delete()
    .eq(field, value)
    .select('id, token, display_name')
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo eliminar el invitado desde Supabase.')
  }

  return data ?? null
}

async function main() {
  const { token, id } = parseArgs(process.argv.slice(2))
  const field = token ? 'token' : 'id'
  const value = token || id
  const supabaseUrl = getSupabaseUrl()
  const databasePassword = getDatabasePassword()
  const serviceRoleKey = getServiceRoleKey()

  if (!value) {
    throw new Error('Debes indicar --token "valor" o --id "uuid".')
  }

  if (!supabaseUrl) {
    throw new Error('Falta SUPABASE_URL/NUXT_SUPABASE_URL en el entorno.')
  }

  let deletedGuest = null

  if (databasePassword) {
    deletedGuest = await deleteWithDatabase(supabaseUrl, databasePassword, field, value)
  } else if (serviceRoleKey) {
    deletedGuest = await deleteWithSupabase(supabaseUrl, serviceRoleKey, field, value)
  } else {
    throw new Error('Necesitas NUXT_SUPABASE_DB_PASSWORD o NUXT_SUPABASE_SERVICE_ROLE_KEY para eliminar invitados.')
  }

  if (!deletedGuest) {
    console.log('No se encontro ningun invitado con ese identificador.')
    return
  }

  console.log(`Invitado eliminado: ${deletedGuest.display_name} (${deletedGuest.token}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})