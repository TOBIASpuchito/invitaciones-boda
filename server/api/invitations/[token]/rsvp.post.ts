import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'

import { getInvitationByToken, submitInvitationRsvp } from '../../../utils/invitations-repository'

const rsvpSchema = z.object({
  attendance: z.enum(['yes', 'no']),
  confirmedCount: z.number().int().min(0).max(12),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(400).optional(),
  guestNames: z.array(z.string().trim().min(1).max(80)).max(12),
})

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token de invitacion invalido.' })
  }

  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitacion no encontrada.' })
  }

  const body = await readBody(event)
  const parsed = rsvpSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Solicitud RSVP invalida.',
    })
  }

  const payload = {
    attendance: parsed.data.attendance,
    confirmedCount: parsed.data.confirmedCount,
    phone: parsed.data.phone?.trim() || undefined,
    message: parsed.data.message?.trim() || undefined,
    guestNames: parsed.data.guestNames,
  }

  if (payload.attendance === 'yes') {
    if (payload.confirmedCount < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Debes confirmar al menos 1 asistente.' })
    }

    if (payload.confirmedCount > invitation.allowedGuests) {
      throw createError({ statusCode: 400, statusMessage: 'La confirmacion supera los cupos reservados.' })
    }

    if (payload.guestNames.length > payload.confirmedCount) {
      throw createError({ statusCode: 400, statusMessage: 'Los nombres enviados superan la cantidad confirmada.' })
    }
  }

  if (payload.attendance === 'no' && payload.confirmedCount !== 0) {
    throw createError({ statusCode: 400, statusMessage: 'Si no asistes, la cantidad confirmada debe ser 0.' })
  }

  const updatedInvitation = await submitInvitationRsvp(token, payload)

  if (!updatedInvitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitacion no encontrada.' })
  }

  return {
    invitation: updatedInvitation,
    message: payload.attendance === 'yes'
      ? 'Tu confirmacion fue guardada correctamente.'
      : 'Tu respuesta fue guardada correctamente.',
  }
})
