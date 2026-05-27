import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { addCredits, setTier } from '~/lib/.server/db/credits.server';
import { CREDIT_PACKAGES, TIER_PLANS } from '~/lib/constants/plans';

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((item) => {
    const [name, ...rest] = item.trim().split('=');
    if (name) cookies[decodeURIComponent(name.trim())] = decodeURIComponent(rest.join('=').trim());
  });
  return cookies;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const itemId = url.searchParams.get('item');
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const userId = cookies['botify_uid'];

  if (!userId || !itemId) {
    return json({ error: 'Не авторизован' }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return json({ error: 'Telegram Stars временно недоступен' }, { status: 503 });
  }

  let stars = 0;
  let title = '';
  let description = '';

  if (type === 'package') {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === itemId);
    if (!pkg) return json({ error: 'Пакет не найден' }, { status: 404 });
    stars = pkg.price_stars;
    title = `${pkg.credits} кредитов`;
    description = `Пополнение баланса Botify: ${pkg.credits} AI-генераций`;
  } else if (type === 'plan') {
    const plan = TIER_PLANS.find((p) => p.id === itemId && p.price_stars > 0);
    if (!plan) return json({ error: 'Тариф не найден' }, { status: 404 });
    stars = plan.price_stars;
    title = `Тариф ${plan.name}`;
    description = `Подписка Botify ${plan.name}: ${plan.credits} кредитов на 30 дней`;
  } else {
    return json({ error: 'Неверный тип' }, { status: 400 });
  }

  const payload = `${type}:${itemId}:${userId}`;
  const invoiceRes = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      payload,
      currency: 'XTR',
      prices: [{ label: title, amount: stars }],
    }),
  });

  const invoiceData = (await invoiceRes.json()) as { ok: boolean; result?: string; description?: string };

  if (!invoiceData.ok) {
    return json({ error: invoiceData.description || 'Ошибка создания инвойса' }, { status: 500 });
  }

  return json({ url: invoiceData.result, stars, title });
}

export async function action({ request }: ActionFunctionArgs) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return new Response('disabled', { status: 503 });

  const body = await request.json<{ update_id: number; pre_checkout_query?: any; message?: any }>();

  if (body.pre_checkout_query) {
    const pcq = body.pre_checkout_query;
    await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pre_checkout_query_id: pcq.id, ok: true }),
    });
    return new Response('ok');
  }

  if (body.message?.successful_payment) {
    const payment = body.message.successful_payment;
    const payload: string = payment.invoice_payload;
    const parts = payload.split(':');
    if (parts.length < 3) return new Response('bad payload');

    const [type, itemId, userId] = parts;

    if (type === 'package') {
      const pkg = CREDIT_PACKAGES.find((p) => p.id === itemId);
      if (pkg) addCredits(userId, pkg.credits, `Покупка пакета: ${pkg.credits} кредитов (Telegram Stars)`);
    } else if (type === 'plan') {
      const plan = TIER_PLANS.find((p) => p.id === itemId);
      if (plan) {
        addCredits(userId, plan.credits, `Тариф ${plan.name}: ${plan.credits} кредитов (Telegram Stars)`);
        setTier(userId, plan.id, 30);
      }
    }
  }

  return new Response('ok');
}
