import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import { requireAdminSession } from '../../../utils/admin-auth'
import { importAdminInvitations } from '../../../utils/invitations-repository'

const invitationSchema = z.object({
  displayName: z.string().trim().min(1, 'Cada invitado debe tener un nombre principal.').max(180),
  namedGuests: z.array(z.string().trim().min(1).max(80)).min(1, 'Cada fila debe tener al menos un nombre.').max(12),
  relationship: z.string().trim().max(120).default(''),
  allowedGuests: z.number().int().min(1, 'Cada invitado debe tener al menos 1 cupo.').max(12, 'El máximo permitido es 12 cupos.'),
  notes: z.string().trim().max(400).optional(),
})

const importSchema = z.object({
  invitations: z.array(invitationSchema).min(1, 'El archivo no contiene invitados válidos.').max(1000, 'El archivo excede el máximo permitido de 1000 invitados.'),
})

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)
  const parsed = importSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'No se pudo procesar el archivo.',
    })
  }

  for (const invitation of parsed.data.invitations) {
    if (invitation.namedGuests.length > invitation.allowedGuests) {
      throw createError({
        statusCode: 400,
        statusMessage: `Los invitados nominales de ${invitation.displayName} no pueden superar los cupos permitidos.`,
      })
    }
  }

  const invitations = await importAdminInvitations(parsed.data.invitations)

  return {
    invitations,
    createdCount: invitations.length,
    message: invitations.length === 1
      ? 'Se importó 1 invitación correctamente.'
      : `Se importaron ${invitations.length} invitaciones correctamente.`,
  }
})