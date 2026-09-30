export interface Account {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export class AuthError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code = "") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}/api${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new AuthError(
      "Não foi possível conectar à sua conta. Verifique sua conexão e tente novamente. O calendário continua disponível sem entrar.",
      0,
    );
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const fields = body?.fieldErrors as Record<string, string> | undefined;
    throw new AuthError(
      (fields && Object.values(fields).join(" ")) ||
        body?.message ||
        "Não foi possível concluir a solicitação. Tente novamente.",
      response.status,
      body?.code,
    );
  }
  if (!body)
    throw new AuthError(
      "O serviço de contas está indisponível. Tente novamente em instantes.",
      502,
    );
  return body as T;
}

export async function apiMutate<T>(path: string, body: unknown): Promise<T> {
  // Fetch a fresh token for every mutation: login/logout rotate the session token.
  for (let attempt = 0; attempt < 2; attempt++) {
    const csrf = await apiRequest<{ token: string; headerName: string }>(
      "/auth/csrf",
    );
    try {
      return await apiRequest<T>(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (
        !(error instanceof AuthError) ||
        error.code !== "CSRF_INVALID" ||
        attempt > 0
      )
        throw error;
    }
  }
  throw new AuthError("Atualize a página e tente novamente.", 403);
}

export async function currentAccount(): Promise<Account | null> {
  try {
    return await apiRequest<Account>("/auth/me");
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) return null;
    throw error;
  }
}
export const login = (email: string, password: string) =>
  apiMutate<Account>("/auth/login", { email, password });
export const register = (name: string, email: string, password: string) =>
  apiMutate<Account>("/auth/register", { name, email, password });
export const logout = () => apiMutate<void>("/auth/logout", {});
