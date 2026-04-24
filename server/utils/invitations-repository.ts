import { createClient } from '@supabase/supabase-js'
import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getSupabaseDatabasePool } from './database'
import { normalizeText, slugifyText } from './text'

export type InvitationStatus = 'pending' | 'confirmed' | 'declined'
export type Attendance = 'yes' | 'no'

export interface InvitationRsvpRecord {
  attendance: Attendance
  confirmedCount: number
  phone?: string | null
  message?: string | null
  guestNames: string[]
  submittedAt: string
}

export interface InvitationSummary {
  token: string
  displayName: string
  relationship: string
  allowedGuests: number
  notes?: string | null
  status: InvitationStatus
}

export interface InvitationDetail extends InvitationSummary {
  namedGuests: string[]
  confirmedCount: number | null
  rsvp: InvitationRsvpRecord | null
}

export interface AdminInvitation extends InvitationDetail {
  id: string
  createdAt: string
  updatedAt: string
}

export interface RsvpPayload {
  attendance: Attendance
  confirmedCount: number
  phone?: string
  message?: string
  guestNames: string[]
}

export interface AdminCreateInvitationPayload {
  displayName: string
  namedGuests: string[]
  relationship: string
  allowedGuests: number
  notes?: string
}

async function createSingleAdminInvitation(
  payload: AdminCreateInvitationPayload,
  database: ReturnType<typeof getSupabaseDatabasePool>,
  client: ReturnType<typeof getSupabaseAdminClient>,
) {
  const searchName = buildInvitationSearchName(payload.displayName, payload.relationship, payload.namedGuests)
  const notes = payload.notes?.trim() || null

  if (database) {
    const token = await generateUniqueToken(payload.displayName, async (candidateToken) => {
      const { rows } = await database.query<{ id: string }>(
        `select id from public.invitations where token = $1 limit 1`,
        [candidateToken],
      )

      return Boolean(rows[0])
    })

    const { rows } = await database.query<SupabaseInvitationRow>(
      `
        insert into public.invitations (
          token,
          display_name,
          named_guests,
          relationship,
          allowed_guests,
          notes,
          search_name,
          status,
          confirmed_count
        )
        values ($1, $2, $3::text[], $4, $5, $6, $7, 'pending', null)
        returning id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name, created_at, updated_at
      `,
      [token, payload.displayName, payload.namedGuests, payload.relationship, payload.allowedGuests, notes, searchName],
    )

    if (!rows[0]) {
      throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la invitación.' })
    }

    return mapAdminInvitation(rows[0], null)
  }

  const supabaseClient = requireSupabaseAdminClient(client)
  const token = await generateUniqueToken(payload.displayName, async (candidateToken) => {
    const { data, error } = await supabaseClient
      .from('invitations')
      .select('id')
      .eq('token', candidateToken)
      .maybeSingle()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'No se pudo validar el token de la invitación.' })
    }

    return Boolean(data)
  })

  const { data, error } = await supabaseClient
    .from('invitations')
    .insert({
      token,
      display_name: payload.displayName,
      named_guests: payload.namedGuests,
      relationship: payload.relationship,
      allowed_guests: payload.allowedGuests,
      notes,
      search_name: searchName,
      status: 'pending',
      confirmed_count: null,
    })
    .select('id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name, created_at, updated_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la invitación.' })
  }

  return mapAdminInvitation(data as SupabaseInvitationRow, null)
}

interface SupabaseInvitationRow {
  id: string
  token: string
  display_name: string
  named_guests: string[]
  relationship: string
  allowed_guests: number
  notes: string | null
  status: InvitationStatus
  confirmed_count: number | null
  search_name: string
  created_at?: string
  updated_at?: string
}

interface SupabaseRsvpRow {
  invitation_id?: string
  attendance: Attendance
  confirmed_count: number
  phone: string | null
  message: string | null
  guest_names: string[] | null
  submitted_at: string
}

interface DatabaseInvitationRow extends SupabaseInvitationRow {
  rsvp_attendance: Attendance | null
  rsvp_confirmed_count: number | null
  rsvp_phone: string | null
  rsvp_message: string | null
  rsvp_guest_names: string[] | null
  rsvp_submitted_at: string | null
}

function getSupabaseAdminClient() {
  const config = useRuntimeConfig()
  const supabaseKey = config.supabaseServiceRoleKey

  if (!config.supabaseUrl || !supabaseKey) {
    return null
  }

  return createClient(config.supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function scoreInvitation(displayName: string, namedGuests: string[], normalizedQuery: string) {
  const candidates = [displayName, ...namedGuests].map((value) => normalizeText(value))

  if (candidates.some((value) => value === normalizedQuery)) {
    return 0
  }

  if (candidates.some((value) => value.startsWith(normalizedQuery))) {
    return 1
  }

  if (candidates.some((value) => value.includes(normalizedQuery))) {
    return 2
  }

  return 3
}

function buildInvitationSearchName(displayName: string, relationship: string, namedGuests: string[]) {
  return normalizeText([displayName, relationship, ...namedGuests].join(' '))
}

function assertDataAccessConfigured(
  database: ReturnType<typeof getSupabaseDatabasePool>,
  client: ReturnType<typeof getSupabaseAdminClient>,
) {
  if (!database && !client) {
    throw createError({
      statusCode: 500,
      statusMessage: 'La aplicación no tiene acceso configurado a Supabase o Postgres.',
    })
  }
}

function requireSupabaseAdminClient(client: ReturnType<typeof getSupabaseAdminClient>) {
  if (!client) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Falta NUXT_SUPABASE_SERVICE_ROLE_KEY para operar contra Supabase.',
    })
  }

  return client
}

async function generateUniqueToken(displayName: string, tokenExists: (token: string) => Promise<boolean>) {
  const baseToken = slugifyText(displayName) || 'invitado'
  let token = baseToken
  let suffix = 2

  while (await tokenExists(token)) {
    token = `${baseToken}-${suffix}`
    suffix += 1
  }

  return token
}

function mapRsvp(rsvp: SupabaseRsvpRow | null): InvitationRsvpRecord | null {
  return rsvp
    ? {
        attendance: rsvp.attendance,
        confirmedCount: rsvp.confirmed_count,
        phone: rsvp.phone,
        message: rsvp.message,
        guestNames: rsvp.guest_names ?? [],
        submittedAt: rsvp.submitted_at,
      }
    : null
}

function mapSupabaseInvitation(row: SupabaseInvitationRow, rsvp: SupabaseRsvpRow | null): InvitationDetail {
  return {
    token: row.token,
    displayName: row.display_name,
    namedGuests: row.named_guests,
    relationship: row.relationship,
    allowedGuests: row.allowed_guests,
    notes: row.notes,
    status: row.status,
    confirmedCount: row.confirmed_count,
    rsvp: mapRsvp(rsvp),
  }
}

function mapAdminInvitation(row: SupabaseInvitationRow, rsvp: SupabaseRsvpRow | null): AdminInvitation {
  return {
    id: row.id,
    ...mapSupabaseInvitation(row, rsvp),
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  }
}

function mapDatabaseInvitation(row: DatabaseInvitationRow): AdminInvitation {
  return {
    id: row.id,
    token: row.token,
    displayName: row.display_name,
    namedGuests: row.named_guests,
    relationship: row.relationship,
    allowedGuests: row.allowed_guests,
    notes: row.notes,
    status: row.status,
    confirmedCount: row.confirmed_count,
    rsvp: row.rsvp_attendance
      ? {
          attendance: row.rsvp_attendance,
          confirmedCount: row.rsvp_confirmed_count ?? 0,
          phone: row.rsvp_phone,
          message: row.rsvp_message,
          guestNames: row.rsvp_guest_names ?? [],
          submittedAt: row.rsvp_submitted_at ?? row.updated_at ?? row.created_at ?? new Date().toISOString(),
        }
      : null,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  }
}

async function findSupabaseInvitationByToken(token: string) {
  const client = getSupabaseAdminClient()

  if (!client) {
    return null
  }

  const { data, error } = await client
    .from('invitations')
    .select('id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar la invitación.' })
  }

  return (data ?? null) as SupabaseInvitationRow | null
}

export async function searchInvitations(query: string) {
  const normalizedQuery = normalizeText(query)
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

  assertDataAccessConfigured(database, client)

  if (database) {
    const { rows } = await database.query<SupabaseInvitationRow>(
      `
        select id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name
        from public.invitations
        where search_name like $1
        limit 8
      `,
      [`%${normalizedQuery}%`],
    )

    return rows
      .sort((left: SupabaseInvitationRow, right: SupabaseInvitationRow) => {
        const scoreDiff = scoreInvitation(left.display_name, left.named_guests, normalizedQuery) - scoreInvitation(right.display_name, right.named_guests, normalizedQuery)

        return scoreDiff || left.display_name.localeCompare(right.display_name)
      })
      .map((row: SupabaseInvitationRow) => ({
        token: row.token,
        displayName: row.display_name,
        relationship: row.relationship,
        allowedGuests: row.allowed_guests,
        notes: row.notes,
        status: row.status,
      }))
  }

  const supabaseClient = requireSupabaseAdminClient(client)

  const { data, error } = await supabaseClient
    .from('invitations')
    .select('id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name')
    .ilike('search_name', `%${normalizedQuery}%`)
    .limit(8)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo buscar invitaciones.' })
  }

  return ((data ?? []) as SupabaseInvitationRow[])
    .sort((left: SupabaseInvitationRow, right: SupabaseInvitationRow) => {
      const scoreDiff = scoreInvitation(left.display_name, left.named_guests, normalizedQuery) - scoreInvitation(right.display_name, right.named_guests, normalizedQuery)

      return scoreDiff || left.display_name.localeCompare(right.display_name)
    })
    .map((row: SupabaseInvitationRow) => ({
      token: row.token,
      displayName: row.display_name,
      relationship: row.relationship,
      allowedGuests: row.allowed_guests,
      notes: row.notes,
      status: row.status,
    }))
}

export async function getInvitationByToken(token: string) {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

  assertDataAccessConfigured(database, client)

  if (database) {
    const { rows } = await database.query<DatabaseInvitationRow>(
      `
        select
          i.id,
          i.token,
          i.display_name,
          i.named_guests,
          i.relationship,
          i.allowed_guests,
          i.notes,
          i.status,
          i.confirmed_count,
          i.search_name,
          i.created_at,
          i.updated_at,
          r.attendance as rsvp_attendance,
          r.confirmed_count as rsvp_confirmed_count,
          r.phone as rsvp_phone,
          r.message as rsvp_message,
          r.guest_names as rsvp_guest_names,
          r.submitted_at as rsvp_submitted_at
        from public.invitations i
        left join lateral (
          select attendance, confirmed_count, phone, message, guest_names, submitted_at
          from public.rsvps
          where invitation_id = i.id
          order by submitted_at desc
          limit 1
        ) r on true
        where i.token = $1
        limit 1
      `,
      [token],
    )

    return rows[0] ? mapDatabaseInvitation(rows[0]) : null
  }

  const supabaseClient = requireSupabaseAdminClient(client)

  const invitationRow = await findSupabaseInvitationByToken(token)

  if (!invitationRow) {
    return null
  }

  const { data, error } = await supabaseClient
    .from('rsvps')
    .select('attendance, confirmed_count, phone, message, guest_names, submitted_at')
    .eq('invitation_id', invitationRow.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar la respuesta RSVP.' })
  }

  return mapSupabaseInvitation(invitationRow, (data ?? null) as SupabaseRsvpRow | null)
}

export async function submitInvitationRsvp(token: string, payload: RsvpPayload) {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()
  const status: InvitationStatus = payload.attendance === 'yes' ? 'confirmed' : 'declined'

  assertDataAccessConfigured(database, client)

  if (database) {
    const connection = await database.connect()

    try {
      await connection.query('begin')

      const invitationResult = await connection.query<{ id: string }>(
        `select id from public.invitations where token = $1 limit 1`,
        [token],
      )

      if (!invitationResult.rows[0]) {
        await connection.query('rollback')
        return null
      }

      const invitationId = invitationResult.rows[0].id

      await connection.query(
        `
          insert into public.rsvps (invitation_id, attendance, confirmed_count, guest_names, phone, message)
          values ($1, $2, $3, $4::text[], $5, $6)
        `,
        [invitationId, payload.attendance, payload.confirmedCount, payload.guestNames, payload.phone ?? null, payload.message ?? null],
      )

      await connection.query(
        `
          update public.invitations
          set status = $2, confirmed_count = $3, updated_at = now()
          where id = $1
        `,
        [invitationId, status, payload.confirmedCount],
      )

      await connection.query('commit')

      return getInvitationByToken(token)
    } catch {
      await connection.query('rollback')
      throw createError({ statusCode: 500, statusMessage: 'No se pudo guardar la respuesta RSVP.' })
    } finally {
      connection.release()
    }
  }

  const supabaseClient = requireSupabaseAdminClient(client)

  const invitationRow = await findSupabaseInvitationByToken(token)

  if (!invitationRow) {
    return null
  }

  const { error: insertError } = await supabaseClient.from('rsvps').insert({
    invitation_id: invitationRow.id,
    attendance: payload.attendance,
    confirmed_count: payload.confirmedCount,
    guest_names: payload.guestNames,
    phone: payload.phone ?? null,
    message: payload.message ?? null,
  })

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo guardar la respuesta RSVP.' })
  }

  const { error: updateError } = await supabaseClient
    .from('invitations')
    .update({
      status,
      confirmed_count: payload.confirmedCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationRow.id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo actualizar el estado de la invitación.' })
  }

  return getInvitationByToken(token)
}

export async function createAdminInvitation(payload: AdminCreateInvitationPayload) {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

  assertDataAccessConfigured(database, client)

  return createSingleAdminInvitation(payload, database, client)
}

export async function importAdminInvitations(payloads: AdminCreateInvitationPayload[]) {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

  assertDataAccessConfigured(database, client)

  const invitations: AdminInvitation[] = []

  for (const payload of payloads) {
    invitations.push(await createSingleAdminInvitation(payload, database, client))
  }

  return invitations
}

export async function deleteAdminInvitation(id: string) {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

  assertDataAccessConfigured(database, client)

  if (database) {
    const { rows } = await database.query<{ id: string }>(
      `delete from public.invitations where id = $1 returning id`,
      [id],
    )

    return Boolean(rows[0])
  }

  const supabaseClient = requireSupabaseAdminClient(client)
  const { data, error } = await supabaseClient
    .from('invitations')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo eliminar la invitación.' })
  }

  return Boolean(data)
}

export async function listAdminInvitations(filters?: { query?: string; status?: InvitationStatus | 'all' }) {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()
  const normalizedQuery = normalizeText(filters?.query ?? '')
  const hasQuery = Boolean(normalizedQuery)
  const statusFilter = filters?.status && filters.status !== 'all' ? filters.status : null

  assertDataAccessConfigured(database, client)

  if (database) {
    const whereClauses = ['1 = 1']
    const queryParams: Array<string> = []

    if (hasQuery) {
      queryParams.push(`%${normalizedQuery}%`)
      whereClauses.push(`i.search_name like $${queryParams.length}`)
    }

    if (statusFilter) {
      queryParams.push(statusFilter)
      whereClauses.push(`i.status = $${queryParams.length}`)
    }

    const { rows } = await database.query<DatabaseInvitationRow>(
      `
        select
          i.id,
          i.token,
          i.display_name,
          i.named_guests,
          i.relationship,
          i.allowed_guests,
          i.notes,
          i.status,
          i.confirmed_count,
          i.search_name,
          i.created_at,
          i.updated_at,
          r.attendance as rsvp_attendance,
          r.confirmed_count as rsvp_confirmed_count,
          r.phone as rsvp_phone,
          r.message as rsvp_message,
          r.guest_names as rsvp_guest_names,
          r.submitted_at as rsvp_submitted_at
        from public.invitations i
        left join lateral (
          select attendance, confirmed_count, phone, message, guest_names, submitted_at
          from public.rsvps
          where invitation_id = i.id
          order by submitted_at desc
          limit 1
        ) r on true
        where ${whereClauses.join(' and ')}
        order by i.display_name asc
      `,
      queryParams,
    )

    return rows.map(mapDatabaseInvitation)
  }

  const supabaseClient = requireSupabaseAdminClient(client)

  let invitationsQuery = supabaseClient
    .from('invitations')
    .select('id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name, created_at, updated_at')
    .order('display_name', { ascending: true })

  if (hasQuery) {
    invitationsQuery = invitationsQuery.ilike('search_name', `%${normalizedQuery}%`)
  }

  if (statusFilter) {
    invitationsQuery = invitationsQuery.eq('status', statusFilter)
  }

  const { data: invitationsData, error: invitationsError } = await invitationsQuery

  if (invitationsError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar el panel de invitados.' })
  }

  const invitationRows = (invitationsData ?? []) as SupabaseInvitationRow[]

  if (!invitationRows.length) {
    return []
  }

  const invitationIds = invitationRows.map((row) => row.id)
  const { data: rsvpsData, error: rsvpsError } = await supabaseClient
    .from('rsvps')
    .select('invitation_id, attendance, confirmed_count, phone, message, guest_names, submitted_at')
    .in('invitation_id', invitationIds)
    .order('submitted_at', { ascending: false })

  if (rsvpsError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar el panel de invitados.' })
  }

  const latestRsvps = new Map<string, SupabaseRsvpRow>()

  for (const rsvp of (rsvpsData ?? []) as SupabaseRsvpRow[]) {
    if (rsvp.invitation_id && !latestRsvps.has(rsvp.invitation_id)) {
      latestRsvps.set(rsvp.invitation_id, rsvp)
    }
  }

  return invitationRows.map((row) => mapAdminInvitation(row, latestRsvps.get(row.id) ?? null))
}
