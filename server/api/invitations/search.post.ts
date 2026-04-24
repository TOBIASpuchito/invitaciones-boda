import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import { searchInvitations } from '../../utils/invitations-repository'

const searchSchema = z.object({
  query: z.string().trim().min(2, 'Escribe al menos 2 caracteres para buscar.').max(120),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = searchSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Solicitud inválida.',
    })
  }

  const results = await searchInvitations(parsed.data.query)

  return { results }
})
