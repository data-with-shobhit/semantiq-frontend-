import { useAuthStore } from '@/store/auth';

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401) {
    useAuthStore.getState().clearToken();
    if (typeof window !== 'undefined') window.location.href = '/signin';
  }
  return res;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

// Auth helpers
export const getProfile = () => apiJson<{
  tenant_id: string; email: string; plan: string; domain: string;
  quota_docs: number; quota_tokens: number; created_at: string | null;
}>('/auth/me');

// Workspace helpers
export const getWorkspaces = () => apiJson<{ workspaces: import('./types').Workspace[] }>('/workspaces');
export const createWorkspace = (name: string, domain: string) =>
  apiJson('/workspaces', { method: 'POST', body: JSON.stringify({ name, domain }) });
export const deleteWorkspace = (id: number) =>
  apiJson(`/workspaces/${id}`, { method: 'DELETE' });

// Document helpers
export const listDocuments = (workspaceId: number) =>
  apiJson<{ documents: import('./types').Document[] }>(`/ingest/list?workspace_id=${workspaceId}`);
export const deleteDocument = (docId: number) =>
  apiJson(`/ingest/${docId}`, { method: 'DELETE' });

// Strategy helpers
export const listStrategies = (namedOnly = false) =>
  apiJson<{ strategies: import('./types').Strategy[] }>(`/eval/strategies?named_only=${namedOnly}`);
export const getStrategyHistory = (docId: number) =>
  apiJson<{ strategies: import('./types').Strategy[] }>(`/eval/strategy/${docId}`);

// Eval helpers
export const getEvalHistory = (docId: number) =>
  apiJson<{ eval: import('./types').EvalResult | null }>(`/eval/history/${docId}`);
