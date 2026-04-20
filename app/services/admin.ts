import type { AxiosInstance } from 'axios'
import type { AdminCreateInvitationPayload, AdminImportInvitationsResult, AdminInvitation, InvitationStatus } from '~/types/invitations'

export async function adminLogin(api: AxiosInstance, password: string): Promise<void> {
  await api.post('/api/admin/login', { password })
}

export async function adminLogout(api: AxiosInstance): Promise<void> {
  await api.post('/api/admin/logout')
}

export async function listAdminInvitations(
  api: AxiosInstance,
  filters?: { search?: string; status?: 'all' | InvitationStatus },
): Promise<{ invitations: AdminInvitation[] }> {
  const response = await api.get<{ invitations: AdminInvitation[] }>('/api/admin/invitations', {
    params: {
      search: filters?.search?.trim() || undefined,
      status: filters?.status && filters.status !== 'all' ? filters.status : undefined,
    },
  })

  return response.data
}

export async function createAdminInvitation(
  api: AxiosInstance,
  payload: AdminCreateInvitationPayload,
): Promise<{ invitation: AdminInvitation; message: string }> {
  const response = await api.post<{ invitation: AdminInvitation; message: string }>('/api/admin/invitations', payload)
  return response.data
}

export async function deleteAdminInvitation(
  api: AxiosInstance,
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const response = await api.delete<{ ok: boolean; message: string }>(`/api/admin/invitations/${id}`)
  return response.data
}

export async function importAdminInvitations(
  api: AxiosInstance,
  invitations: AdminCreateInvitationPayload[],
): Promise<AdminImportInvitationsResult> {
  const response = await api.post<AdminImportInvitationsResult>('/api/admin/invitations/import', { invitations }, {
    timeout: 120_000,
  })
  return response.data
}
