import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import { requireAdminSession } from '../../utils/admin-auth'
import { createAdminInvitation } from '../../utils/invitations-repository'

const createInvitationSchema = z.object({
  displayName: z.string().trim().min(1, 'Escribe el nombre principal del invitado.').max(180),
  namedGuests: z.array(z.string().trim().min(1).max(80)).min(1, 'Debes indicar al menos un nombre.').max(12),
  relationship: z.string().trim().max(120).default(''),
  allowedGuests: z.number().int().min(1, 'Debe haber al menos 1 cupo.').max(12, 'El máximo permitido es 12 cupos.'),
  notes: z.string().trim().max(400).optional(),
})

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)
  const parsed = createInvitationSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Solicitud inválida.',
    })
  }

  if (parsed.data.namedGuests.length > parsed.data.allowedGuests) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Los invitados nominales no pueden superar los cupos permitidos.',
    })
  }

  const invitation = await createAdminInvitation({
    displayName: parsed.data.displayName,
    namedGuests: parsed.data.namedGuests,
    relationship: parsed.data.relationship,
    allowedGuests: parsed.data.allowedGuests,
    notes: parsed.data.notes?.trim() || undefined,
  })

  return {
    invitation,
    message: 'Invitación creada correctamente.',
  }
})