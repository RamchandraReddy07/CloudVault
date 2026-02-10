type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${path.startsWith("/") ? "" : "/"}${path}`
}

async function safeParseJson(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  async request<T>(
    method: HttpMethod,
    path: string,
    opts?: {
      token?: string
      body?: unknown
      signal?: AbortSignal
      timeoutMs?: number
      headers?: Record<string, string>
    }
  ): Promise<T> {
    const { token, body, signal, timeoutMs = 15000, headers = {} } = opts || {}

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const combinedSignal = signal ?? controller.signal

    try {
      const res = await fetch(buildUrl(path), {
        method,
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: combinedSignal,
      })

      const data = await safeParseJson(res)

      if (!res.ok) {
        const message =
          (data &&
            typeof data === "object" &&
            ((data as Record<string, string>).error ||
              (data as Record<string, string>).message)) ||
          `HTTP Error ${res.status}`
        throw new ApiError(message, res.status, data)
      }

      return data as T
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiError("Request timed out", 408)
      }
      if (err instanceof ApiError) throw err
      throw new ApiError(
        err instanceof Error ? err.message : "Network error",
        0
      )
    } finally {
      clearTimeout(timeout)
    }
  },

  get<T>(path: string, token?: string) {
    return api.request<T>("GET", path, { token })
  },

  post<T>(path: string, body?: unknown, token?: string) {
    return api.request<T>("POST", path, { token, body })
  },

  put<T>(path: string, body?: unknown, token?: string) {
    return api.request<T>("PUT", path, { token, body })
  },

  delete<T>(path: string, token?: string) {
    return api.request<T>("DELETE", path, { token })
  },
}
