import { submitRsvp } from '~/services/invitations'
import type { InvitationDetail, InvitationRsvpPayload } from '~/types/invitations'
import { getApiErrorMessage } from '~/utils/api-error'

export async function useInvitation(token: string) {
  const api = useApiClient()

  const { data, pending, error } = await useFetch<{ invitation: InvitationDetail }>(`/api/invitations/${token}`, {
    key: `invitation-${token}`,
    deep: false,
  })

  const invitation = computed(() => data.value?.invitation ?? null)
  const isSaving = ref(false)
  const submitError = ref('')
  const submitSuccess = ref('')

  async function submit(payload: InvitationRsvpPayload) {
    if (!invitation.value) {
      return
    }

    submitError.value = ''
    submitSuccess.value = ''
    isSaving.value = true

    try {
      const result = await submitRsvp(api, token, payload)
      data.value = { invitation: result.invitation }
      submitSuccess.value = result.message
    } catch (err) {
      submitError.value = getApiErrorMessage(err, 'No pudimos guardar tu respuesta.')
    } finally {
      isSaving.value = false
    }
  }

  return { invitation, pending, error, isSaving, submitError, submitSuccess, submit }
}
