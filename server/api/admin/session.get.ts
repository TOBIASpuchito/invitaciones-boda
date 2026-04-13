import { defineEventHandler } from 'h3'

import { hasValidAdminSession } from '../../utils/admin-auth'

export default defineEventHandler((event) => {
  return {
    authenticated: hasValidAdminSession(event),
  }
})