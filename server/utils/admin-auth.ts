import { createHmac, timingSafeEqual } from 'node:crypto'
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

const ADMIN_COOKIE_NAME = 'admin_session'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12

function createSignature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function getAdminPassword() {
  const config = useRuntimeConfig()

  return config.adminPassword.trim()
}

export function ensureAdminPasswordConfigured() {
  if (!getAdminPassword()) {
    throw createError({
      statusCode: 500,
      statusMessage: 'La clave de administrador no está configurada.',
    })
  }
}

export function createAdminSessionValue() {
  const adminPassword = getAdminPassword()
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000
  const payload = String(expiresAt)
  const signature = createSignature(payload, adminPassword)

  return `${payload}.${signature}`
}

export function setAdminSession(event: H3Event) {
  setCookie(event, ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, ADMIN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export function hasValidAdminSession(event: H3Event) {
  const adminPassword = getAdminPassword()
  const cookieValue = getCookie(event, ADMIN_COOKIE_NAME)

  if (!adminPassword || !cookieValue) {
    return false
  }

  const [expiresAt, signature] = cookieValue.split('.')

  if (!expiresAt || !signature) {
    return false
  }

  const expectedSignature = createSignature(expiresAt, adminPassword)

  if (expectedSignature.length !== signature.length) {
    return false
  }

  const isValidSignature = timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

  if (!isValidSignature) {
    return false
  }

  return Number(expiresAt) > Date.now()
}

export function requireAdminSession(event: H3Event) {
  ensureAdminPasswordConfigured()

  if (!hasValidAdminSession(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Debes iniciar sesión como administrador.',
    })
  }
}