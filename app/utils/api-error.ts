import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (data && typeof data === 'object') {
      const normalized = data as { statusMessage?: string; message?: string }

      return normalized.statusMessage ?? normalized.message ?? error.message ?? fallback
    }

    return error.message ?? fallback
  }

  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data

    return data?.statusMessage ?? data?.message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}