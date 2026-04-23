import { searchInvitations } from '~/services/invitations'
import { getApiErrorMessage } from '~/utils/api-error'

export function useInvitationSearch() {
  const api = useApiClient()
  const { primeInvitationMusic, stopInvitationMusic } = useInvitationMusic()
  const guestName = ref('')
  const isSearching = ref(false)
  const error = ref('')

  async function search() {
    const query = guestName.value.trim()

    error.value = ''

    if (query.split(/\s+/).filter(Boolean).length < 2) {
      error.value = 'Escribe tus nombres y apellidos para continuar.'
      return
    }

    void primeInvitationMusic()

    isSearching.value = true

    try {
      const results = await searchInvitations(api, query)

      if (!results.length || !results[0]) {
        stopInvitationMusic()
        error.value = 'No encontramos ese nombre en la lista de invitados.'
        return
      }

      await navigateTo(`/invitacion/${results[0].token}`)
    } catch (err) {
      stopInvitationMusic()
      error.value = getApiErrorMessage(err, 'No pudimos buscar tu invitacion.')
    } finally {
      isSearching.value = false
    }
  }

  return { guestName, isSearching, error, search }
}
