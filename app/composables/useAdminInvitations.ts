import { createAdminInvitation, deleteAdminInvitation, importAdminInvitations as importAdminInvitationsRequest, listAdminInvitations as listAdminInvitationsRequest } from '~/services/admin'
import type { AdminCreateInvitationPayload, AdminInvitation, InvitationStatus } from '~/types/invitations'

export async function useAdminInvitations() {
  const api = useApiClient()

  const invitations = ref<AdminInvitation[]>([])
  const pending = ref(false)
  const fetchError = ref<{ statusCode?: number; statusMessage?: string } | null>(null)
  const createLoading = ref(false)
  const importLoading = ref(false)
  const deletingId = ref('')
  const activeFilters = reactive<{
    search: string
    status: 'all' | InvitationStatus
  }>({
    search: '',
    status: 'all',
  })

  async function refresh() {
    pending.value = true

    try {
      const result = await listAdminInvitationsRequest(api, {
        search: activeFilters.search,
        status: activeFilters.status,
      })

      invitations.value = result.invitations
      fetchError.value = null
    } catch (error: any) {
      invitations.value = []
      fetchError.value = {
        statusCode: error?.response?.status,
        statusMessage: error?.response?.data?.statusMessage ?? error?.message ?? 'No se pudo cargar el panel de invitados.',
      }
    } finally {
      pending.value = false
    }
  }

  async function applyFilters(filters: { search?: string; status?: 'all' | InvitationStatus }) {
    activeFilters.search = filters.search?.trim() ?? ''
    activeFilters.status = filters.status ?? 'all'
    await refresh()
  }

  async function clearFilters() {
    activeFilters.search = ''
    activeFilters.status = 'all'
    await refresh()
  }

  await refresh()

  async function create(payload: AdminCreateInvitationPayload) {
    createLoading.value = true
    try {
      const result = await createAdminInvitation(api, payload)
      await refresh()
      return result
    } finally {
      createLoading.value = false
    }
  }

  async function remove(id: string) {
    deletingId.value = id
    try {
      const result = await deleteAdminInvitation(api, id)
      await refresh()
      return result
    } finally {
      deletingId.value = ''
    }
  }

  async function importMany(payloads: AdminCreateInvitationPayload[]) {
    importLoading.value = true
    try {
      const result = await importAdminInvitationsRequest(api, payloads)
      await refresh()
      return result
    } finally {
      importLoading.value = false
    }
  }

  return { invitations, pending, fetchError, refresh, applyFilters, clearFilters, activeFilters, createLoading, importLoading, deletingId, create, importMany, remove }
}
