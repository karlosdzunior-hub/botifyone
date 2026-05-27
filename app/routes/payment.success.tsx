import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => [{ title: 'Оплата прошла — Botify' }];

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold mb-2">Оплата прошла!</h1>
        <p className="text-bolt-elements-textSecondary mb-8">
          Кредиты уже зачислены на твой баланс. Можешь продолжать создавать приложения.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-all"
        >
          <span>⚡</span> Вернуться в Botify
        </Link>
      </div>
    </div>
  );
}
