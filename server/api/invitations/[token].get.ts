import { createError, defineEventHandler, getRouterParam } from 'h3'

import { getInvitationByToken } from '../../utils/invitations-repository'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token de invitacion invalido.' })
  }

  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitacion no encontrada.' })
  }

  return { invitation }
})
