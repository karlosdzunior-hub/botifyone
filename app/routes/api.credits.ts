import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { getOrCreateUser } from '~/lib/.server/db/credits.server';

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
  const userId = cookies['botify_uid'];

  if (!userId) {
    return json({ credits: 0, tier: 'free', authenticated: false });
  }

  const user = getOrCreateUser(userId);
  return json({ credits: user.credits, tier: user.tier, authenticated: true });
}
