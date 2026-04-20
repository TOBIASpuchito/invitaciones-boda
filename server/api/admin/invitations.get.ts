import { defineEventHandler, getQuery } from 'h3'

import { requireAdminSession } from '../../utils/admin-auth'
import { listAdminInvitations } from '../../utils/invitations-repository'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search : ''
  const status = typeof query.status === 'string' ? query.status : 'all'

  const invitations = await listAdminInvitations({
    query: search,
    status: status === 'confirmed' || status === 'pending' || status === 'declined' ? status : 'all',
  })

  return { invitations }
})