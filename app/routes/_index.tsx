import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { getOrCreateUser } from '~/lib/.server/db/credits.server';
import { randomUUID } from 'crypto';

export const meta: MetaFunction = () => {
  return [{ title: 'Botify' }, { name: 'description', content: 'Talk with Botify, your AI assistant for building apps and bots' }];
};

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
  const headers: Record<string, string> = {};

  if (!userId) {
    userId = randomUUID();
    headers['Set-Cookie'] =
      `botify_uid=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
  }

  getOrCreateUser(userId);

  return json({}, { headers });
}

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
