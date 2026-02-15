// src/services/api.ts

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const BASE_URL =
  // Vite style env var first
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  // fallback for other setups
  (typeof import.meta.env.VITE_API_BASE_URL !== "undefined" ? (import.meta.env.VITE_API_BASE_URL as string) : "") ||
  "http://localhost:3000/api";

function buildUrl(path: string) {
  // supports passing "/api/files" or full URL
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function safeParseJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // if backend returns plain text
  }
}

export const api = {
  async request<T>(
    method: HttpMethod,
    path: string,
    opts?: {
      token?: string;
      body?: any;
      // signal?: AbortSignal;
      timeoutMs?: number;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const { token, body, headers = {} } = opts || {};

    // const controller = new AbortController();
    // const timeout = setTimeout(() => controller.abort(), timeoutMs);
    console.log("Build URL", buildUrl(path));
    // if caller passed a signal, we should respect it too
    // const combinedSignal = signal;

    try {
      const res = await fetch(buildUrl(path), {
        method,
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,

        // credentials: "include", // enables cookie-based auth/refresh if you use it
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        const message =
          (data && typeof data === "object" && (data.error || data.message)) ||
          `HTTP Error ${res.status}`;
        throw new ApiError(message, res.status, data);
      }

      return data as T;
    } catch (err: any) {
      // fetch throws TypeError for network errors
      if (err?.name === "AbortError") {
        throw new ApiError("Request timed out", 408);
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(err?.message || "Network error", 0);
    }
    //finally {
    //   clearTimeout(timeout);
    // }
  },

  get<T>(path: string, token?: string) {
    return api.request<T>("GET", path, { token });
  },

  post<T>(path: string, body?: any, token?: string) {
    return api.request<T>("POST", path, { token, body });
  },

  put<T>(path: string, body?: any, token?: string) {
    return api.request<T>("PUT", path, { token, body });
  },

  delete<T>(path: string, token?: string) {
    return api.request<T>("DELETE", path, { token });
  },

  async login(credentials: any) {
    return api.post<any>("/auth/login", credentials);
  },

  async signup(data: any) {
    return api.post<any>("/auth/signup", data);
  },
};
