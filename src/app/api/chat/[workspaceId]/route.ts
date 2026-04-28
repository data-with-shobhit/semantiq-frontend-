import { kv } from '@vercel/kv';
import { decodeJwt } from 'jose';
import { NextRequest } from 'next/server';

const TTL = 43200; // 12 hours

function getTenantId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    return (payload.sub as string) ?? null;
  } catch { return null; }
}

function chatKey(tenantId: string, workspaceId: string) {
  return `semantiq:chat:${tenantId}:${workspaceId}`;
}

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  const tenantId = getTenantId(req);
  if (!tenantId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await kv.get(chatKey(tenantId, params.workspaceId)) ?? [];
  return Response.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  const tenantId = getTenantId(req);
  if (!tenantId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages } = await req.json();
  await kv.set(chatKey(tenantId, params.workspaceId), messages, { ex: TTL });
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  const tenantId = getTenantId(req);
  if (!tenantId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await kv.del(chatKey(tenantId, params.workspaceId));
  return Response.json({ ok: true });
}
