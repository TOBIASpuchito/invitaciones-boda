import type { AxiosInstance } from 'axios'
import type { InvitationDetail, InvitationRsvpPayload, InvitationSummary } from '~/types/invitations'

export async function searchInvitations(api: AxiosInstance, query: string): Promise<InvitationSummary[]> {
  const response = await api.post<{ results: InvitationSummary[] }>('/api/invitations/search', { query })
  return response.data.results
}

export async function submitRsvp(
  api: AxiosInstance,
  token: string,
  payload: InvitationRsvpPayload,
): Promise<{ invitation: InvitationDetail; message: string }> {
  const response = await api.post<{ invitation: InvitationDetail; message: string }>(
    `/api/invitations/${token}/rsvp`,
    payload,
  )
  return response.data
}
