import { createAdminInvitation, deleteAdminInvitation } from '~/services/admin'
import type { AdminCreateInvitationPayload, AdminInvitation } from '~/types/invitations'

export async function useAdminInvitations() {
  const api = useApiClient()

  const { data, pending, error: fetchError, refresh } = await useFetch<{ invitations: AdminInvitation[] }>('/api/admin/invitations', {
    key: 'admin-invitations',
    deep: false,
  })

  const invitations = computed(() => data.value?.invitations ?? [])
  const createLoading = ref(false)
  const deletingId = ref('')

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

  return { invitations, pending, fetchError, refresh, createLoading, deletingId, create, remove }
}
