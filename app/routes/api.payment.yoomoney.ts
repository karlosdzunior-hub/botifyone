import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { createHash } from 'crypto';
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

  const shopId = process.env.YOOMONEY_SHOP_ID;
  if (!shopId) {
    return json({ error: 'Платежи временно недоступны' }, { status: 503 });
  }

  let amount = 0;
  let label = '';
  let description = '';

  if (type === 'package') {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === itemId);
    if (!pkg) return json({ error: 'Пакет не найден' }, { status: 404 });
    amount = pkg.price_rub;
    label = `pkg:${itemId}:${userId}`;
    description = `Botify — ${pkg.credits} кредитов`;
  } else if (type === 'plan') {
    const plan = TIER_PLANS.find((p) => p.id === itemId && p.price_rub > 0);
    if (!plan) return json({ error: 'Тариф не найден' }, { status: 404 });
    amount = plan.price_rub;
    label = `plan:${itemId}:${userId}`;
    description = `Botify — тариф ${plan.name}`;
  } else {
    return json({ error: 'Неверный тип' }, { status: 400 });
  }

  const successUrl = `${url.origin}/payment/success`;
  const paymentUrl =
    `https://yoomoney.ru/quickpay/confirm.xml` +
    `?receiver=${encodeURIComponent(shopId)}` +
    `&quickpay-form=button` +
    `&targets=${encodeURIComponent(description)}` +
    `&paymentType=AC` +
    `&sum=${amount}` +
    `&label=${encodeURIComponent(label)}` +
    `&successURL=${encodeURIComponent(successUrl)}`;

  return json({ url: paymentUrl, amount, description });
}

export async function action({ request }: ActionFunctionArgs) {
  const secretKey = process.env.YOOMONEY_SECRET_KEY;
  if (!secretKey) {
    return new Response('disabled', { status: 503 });
  }

  const formData = await request.formData();
  const notificationType = formData.get('notification_type') as string;
  const operationId = formData.get('operation_id') as string;
  const amount = formData.get('amount') as string;
  const currency = formData.get('currency') as string;
  const datetime = formData.get('datetime') as string;
  const sender = (formData.get('sender') as string) || '';
  const codePro = (formData.get('codepro') as string) || 'false';
  const label = (formData.get('label') as string) || '';
  const sha1Hash = formData.get('sha1_hash') as string;

  const checkString = [notificationType, operationId, amount, currency, datetime, sender, codePro, secretKey, label].join('&');
  const expectedHash = createHash('sha1').update(checkString).digest('hex');

  if (expectedHash !== sha1Hash) {
    return new Response('bad signature', { status: 400 });
  }

  const parts = label.split(':');
  if (parts.length < 3) {
    return new Response('bad label', { status: 400 });
  }

  const [type, itemId, userId] = parts;

  if (type === 'pkg') {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === itemId);
    if (pkg) {
      addCredits(userId, pkg.credits, `Покупка пакета: ${pkg.credits} кредитов (YooMoney)`);
    }
  } else if (type === 'plan') {
    const plan = TIER_PLANS.find((p) => p.id === itemId);
    if (plan) {
      addCredits(userId, plan.credits, `Тариф ${plan.name}: ${plan.credits} кредитов (YooMoney)`);
      setTier(userId, plan.id, 30);
    }
  }

  return new Response('ok', { status: 200 });
}
