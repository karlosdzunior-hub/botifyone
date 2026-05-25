import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { getOrCreateUser } from '~/lib/.server/db/credits.server';
import { randomUUID } from 'crypto';

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((item) => {
    const [name, ...rest] = item.trim().split('=');
    if (name) cookies[decodeURIComponent(name.trim())] = decodeURIComponent(rest.join('=').trim());
  });
  return cookies;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  let userId = cookies['botify_uid'];
  let isNew = false;

  if (!userId) {
    userId = randomUUID();
    isNew = true;
  }

  const user = getOrCreateUser(userId);

  const headers: Record<string, string> = {};

  if (isNew) {
    headers['Set-Cookie'] =
      `botify_uid=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
  }

  return json({ userId: user.user_id, credits: user.credits, tier: user.tier }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  return loader({ request, context: {} as any, params: {} });
}
