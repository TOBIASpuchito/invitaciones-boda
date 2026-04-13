import { defineEventHandler } from 'h3'

import { requireAdminSession } from '../../utils/admin-auth'
import { listAdminInvitations } from '../../utils/invitations-repository'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const invitations = await listAdminInvitations()

  return { invitations }
})