import axios, { type AxiosInstance } from 'axios'

let client: AxiosInstance | null = null

export function useApiClient() {
  const config = useRuntimeConfig()

  if (import.meta.server) {
    const requestUrl = useRequestURL()
    const origin = `${requestUrl.protocol}//${requestUrl.host}`
    const baseURL = new URL(config.app.baseURL || '/', origin).toString()

    return axios.create({
      baseURL,
      timeout: 10_000,
      withCredentials: true,
      headers: {
        ...useRequestHeaders(['cookie']),
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  }

  if (!client) {
    client = axios.create({
      baseURL: config.app.baseURL || '/',
      timeout: 10_000,
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  }

  return client
}