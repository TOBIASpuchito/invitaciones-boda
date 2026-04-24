import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import { ensureAdminPasswordConfigured, getAdminPassword, setAdminSession } from '../../utils/admin-auth'

const loginSchema = z.object({
  password: z.string().trim().min(1, 'Escribe la clave de administrador.'),
})

export default defineEventHandler(async (event) => {
  ensureAdminPasswordConfigured()

  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Solicitud inválida.',
    })
  }

  if (parsed.data.password !== getAdminPassword()) {
    throw createError({
      statusCode: 401,
      statusMessage: 'La clave de administrador no es correcta.',
    })
  }

  setAdminSession(event)

  return { ok: true }
})