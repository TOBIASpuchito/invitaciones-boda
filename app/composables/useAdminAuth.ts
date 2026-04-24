import { adminLogin, adminLogout } from '~/services/admin'
import { getApiErrorMessage } from '~/utils/api-error'

export function useAdminAuth() {
  const api = useApiClient()
  const loginLoading = ref(false)
  const logoutLoading = ref(false)
  const loginError = ref('')

  async function login(password: string) {
    loginError.value = ''
    loginLoading.value = true

    try {
      await adminLogin(api, password)
      await navigateTo('/admin/dashboard')
    } catch (err) {
      loginError.value = getApiErrorMessage(err, 'No se pudo iniciar sesión.')
    } finally {
      loginLoading.value = false
    }
  }

  async function logout() {
    logoutLoading.value = true

    try {
      await adminLogout(api)
      await navigateTo('/admin')
    } catch (err) {
      console.error(getApiErrorMessage(err, 'No se pudo cerrar sesión.'))
    } finally {
      logoutLoading.value = false
    }
  }

  return { loginLoading, logoutLoading, loginError, login, logout }
}
