interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as ApiError
  return apiError.response?.data?.message || fallback
}


