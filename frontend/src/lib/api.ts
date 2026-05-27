/** API 客户端 — 自动附加 JWT */

const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}

export function hasToken(): boolean {
  return !!getToken();
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // 402 = 额度用完
  if (res.status === 402) {
    const detail = await res.json().catch(() => ({}));
    throw new QuotaExceededError(detail.detail || '额度已用完');
  }

  // 401 = token 过期
  if (res.status === 401) {
    clearToken();
    throw new AuthError('登录已过期');
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new ApiError(res.status, detail.detail || '请求失败');
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

export class AuthError extends Error {}
export class QuotaExceededError extends Error {}

// ── 认证 API ──
export const auth = {
  register: (email: string, password: string, nickname: string) =>
    request<{ ok: boolean; message: string; debug_code?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname }),
    }),

  verify: (email: string, code: string) =>
    request<{ ok: boolean; message: string; token: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  login: (email: string, password: string) =>
    request<{ ok: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: any; usage: any }>('/auth/me'),
};

// ── 支付 API ──
export const payment = {
  status: () => request<{ free_quota: number; used: number; remaining: number; paid: boolean; price: number }>('/payment/status'),

  create: () => request<{ ok: boolean; order_id: number; amount: number; message: string }>('/payment/create', { method: 'POST' }),
};
