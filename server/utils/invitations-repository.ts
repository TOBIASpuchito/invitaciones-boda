import { createClient } from '@supabase/supabase-js'
import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'

import {
  mockInvitations,
  type Attendance,
  type InvitationRecord,
  type InvitationRsvpRecord,
  type InvitationStatus,
} from '../data/mock-invitations'
import { getSupabaseDatabasePool } from './database'
import { normalizeText } from './text'

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

const localStore: InvitationRecord[] = mockInvitations.map((invitation) => structuredClone(invitation))

function getSupabaseAdminClient() {
  const config = useRuntimeConfig()
  const supabaseKey = config.supabaseServiceRoleKey || config.supabaseKey

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

function toInvitationSummary(invitation: InvitationRecord): InvitationSummary {
  return {
    token: invitation.token,
    displayName: invitation.displayName,
    relationship: invitation.relationship,
    allowedGuests: invitation.allowedGuests,
    notes: invitation.notes,
    status: invitation.status,
  }
}

function toInvitationDetail(invitation: InvitationRecord): InvitationDetail {
  return {
    ...toInvitationSummary(invitation),
    namedGuests: invitation.namedGuests,
    confirmedCount: invitation.confirmedCount,
    rsvp: invitation.rsvp,
  }
}

function toAdminInvitation(invitation: InvitationRecord): AdminInvitation {
  return {
    id: invitation.id,
    ...toInvitationDetail(invitation),
    createdAt: invitation.rsvp?.submittedAt ?? new Date().toISOString(),
    updatedAt: invitation.rsvp?.submittedAt ?? new Date().toISOString(),
  }
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
    throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar la invitacion.' })
  }

  return (data ?? null) as SupabaseInvitationRow | null
}

export async function searchInvitations(query: string) {
  const normalizedQuery = normalizeText(query)
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

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
      .sort((left, right) => {
        const scoreDiff = scoreInvitation(left.display_name, left.named_guests, normalizedQuery) - scoreInvitation(right.display_name, right.named_guests, normalizedQuery)

        return scoreDiff || left.display_name.localeCompare(right.display_name)
      })
      .map((row) => ({
        token: row.token,
        displayName: row.display_name,
        relationship: row.relationship,
        allowedGuests: row.allowed_guests,
        notes: row.notes,
        status: row.status,
      }))
  }

  if (!client) {
    return localStore
      .filter((invitation) => invitation.searchName.includes(normalizedQuery))
      .sort((left, right) => {
        const scoreDiff = scoreInvitation(left.displayName, left.namedGuests, normalizedQuery) - scoreInvitation(right.displayName, right.namedGuests, normalizedQuery)

        return scoreDiff || left.displayName.localeCompare(right.displayName)
      })
      .slice(0, 8)
      .map(toInvitationSummary)
  }

  const { data, error } = await client
    .from('invitations')
    .select('id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name')
    .ilike('search_name', `%${normalizedQuery}%`)
    .limit(8)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo buscar invitaciones.' })
  }

  return ((data ?? []) as SupabaseInvitationRow[])
    .sort((left, right) => {
      const scoreDiff = scoreInvitation(left.display_name, left.named_guests, normalizedQuery) - scoreInvitation(right.display_name, right.named_guests, normalizedQuery)

      return scoreDiff || left.display_name.localeCompare(right.display_name)
    })
    .map((row) => ({
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

  if (!client) {
    const invitation = localStore.find((entry) => entry.token === token)
    return invitation ? toInvitationDetail(invitation) : null
  }

  const invitationRow = await findSupabaseInvitationByToken(token)

  if (!invitationRow) {
    return null
  }

  const { data, error } = await client
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

  if (!client) {
    const invitation = localStore.find((entry) => entry.token === token)

    if (!invitation) {
      return null
    }

    invitation.status = status
    invitation.confirmedCount = payload.confirmedCount
    invitation.rsvp = {
      attendance: payload.attendance,
      confirmedCount: payload.confirmedCount,
      phone: payload.phone ?? null,
      message: payload.message ?? null,
      guestNames: payload.guestNames,
      submittedAt: new Date().toISOString(),
    }

    return toInvitationDetail(invitation)
  }

  const invitationRow = await findSupabaseInvitationByToken(token)

  if (!invitationRow) {
    return null
  }

  const { error: insertError } = await client.from('rsvps').insert({
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

  const { error: updateError } = await client
    .from('invitations')
    .update({
      status,
      confirmed_count: payload.confirmedCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationRow.id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo actualizar el estado de la invitacion.' })
  }

  return getInvitationByToken(token)
}

export async function listAdminInvitations() {
  const database = getSupabaseDatabasePool()
  const client = getSupabaseAdminClient()

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
        order by i.display_name asc
      `,
    )

    return rows.map(mapDatabaseInvitation)
  }

  if (!client) {
    return localStore
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map(toAdminInvitation)
  }

  const [{ data: invitationsData, error: invitationsError }, { data: rsvpsData, error: rsvpsError }] = await Promise.all([
    client
      .from('invitations')
      .select('id, token, display_name, named_guests, relationship, allowed_guests, notes, status, confirmed_count, search_name, created_at, updated_at')
      .order('display_name', { ascending: true }),
    client
      .from('rsvps')
      .select('invitation_id, attendance, confirmed_count, phone, message, guest_names, submitted_at')
      .order('submitted_at', { ascending: false }),
  ])

  if (invitationsError || rsvpsError) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo consultar el panel de invitados.' })
  }

  const latestRsvps = new Map<string, SupabaseRsvpRow>()

  for (const rsvp of (rsvpsData ?? []) as SupabaseRsvpRow[]) {
    if (rsvp.invitation_id && !latestRsvps.has(rsvp.invitation_id)) {
      latestRsvps.set(rsvp.invitation_id, rsvp)
    }
  }

  return ((invitationsData ?? []) as SupabaseInvitationRow[]).map((row) => mapAdminInvitation(row, latestRsvps.get(row.id) ?? null))
}
