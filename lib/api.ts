import { ApiEnvelope, AuthTokens } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('accessToken');
}

export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem('accessToken', tokens.accessToken);
  window.localStorage.setItem('refreshToken', tokens.refreshToken);
  window.dispatchEvent(new Event('spacecraft-auth-change'));
}

export function clearTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('spacecraft-auth-change'));
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export async function logout(): Promise<void> {
  if (getAccessToken()) {
    await apiRequest<null>('/auth/logout', { method: 'POST' }).catch(() => null);
  }
  clearTokens();
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const isFormData = init.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearTokens();
      throw new Error('Your session expired. Please sign in again.');
    }

    throw new Error(await readErrorMessage(response));
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;
  const text = await response.text();
  if (!text) return fallback;

  try {
    const payload = JSON.parse(text) as { message?: unknown; error?: unknown };
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.error === 'string') return payload.error;
  } catch {
    return text;
  }

  return fallback;
}

export async function uploadSpaceImages(spaceId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return apiRequest<{ imageIds: string[]; status: 'uploaded' }>(`/spaces/${spaceId}/images`, {
    method: 'POST',
    body: formData,
  });
}
