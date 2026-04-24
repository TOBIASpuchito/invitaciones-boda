import { createError, defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'

import { requireAdminSession } from '../../../utils/admin-auth'
import { deleteAdminInvitation } from '../../../utils/invitations-repository'

const invitationIdSchema = z.string().uuid('Identificador de invitación inválido.')

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')
  const parsedId = invitationIdSchema.safeParse(id)

  if (!parsedId.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsedId.error.issues[0]?.message ?? 'Identificador inválido.',
    })
  }

  const deleted = await deleteAdminInvitation(parsedId.data)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invitación no encontrada.',
    })
  }

  return {
    ok: true,
    message: 'Invitación eliminada correctamente.',
  }
})