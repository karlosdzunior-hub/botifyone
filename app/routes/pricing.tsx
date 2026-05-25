import type { MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { TIER_PLANS, CREDIT_PACKAGES } from '~/lib/constants/plans';

export const meta: MetaFunction = () => [
  { title: 'Тарифы — Botify' },
  { name: 'description', content: 'Выбери тариф и начни создавать приложения с Botify' },
];

export function loader() {
  return json({ plans: TIER_PLANS, packages: CREDIT_PACKAGES });
}

export default function PricingPage() {
  const { plans, packages } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary">
      <div className="max-w-6xl mx-auto px-4 py-16">

        <div className="text-center mb-14">
          <Link to="/" className="inline-flex items-center gap-1.5 text-2xl font-bold text-accent mb-8">
            <span>⚡</span><span>Botify</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 mt-4">Простые и честные тарифы</h1>
          <p className="text-xl text-bolt-elements-textSecondary max-w-xl mx-auto">
            Покупай кредиты — каждый кредит это одна AI‑генерация. Никаких скрытых платежей.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl border p-6 flex flex-col
                ${plan.popular
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-bolt-elements-borderColor bg-bolt-elements-background-depth-2'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Популярный
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price_rub === 0 ? (
                    <span className="text-3xl font-bold">Бесплатно</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">{plan.price_rub} ₽</span>
                      <span className="text-bolt-elements-textSecondary text-sm">/мес</span>
                    </>
                  )}
                </div>
                {plan.price_stars > 0 && (
                  <p className="text-bolt-elements-textSecondary text-sm">или {plan.price_stars} ⭐ Stars</p>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl bg-bolt-elements-background-depth-3">
                <span className="i-ph:lightning-fill text-accent text-lg" />
                <span className="font-semibold text-sm">{plan.credits_label}</span>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-bolt-elements-textSecondary">
                    <span className="i-ph:check-circle-fill text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${plan.popular
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4 border border-bolt-elements-borderColor'
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Докупить кредиты</h2>
          <p className="text-bolt-elements-textSecondary">Подходит к любому тарифу. Кредиты не сгорают.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto mb-20">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-2xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-5 text-center flex flex-col gap-3"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="i-ph:lightning-fill text-accent text-xl" />
                <span className="text-2xl font-bold">{pkg.credits}</span>
                <span className="text-bolt-elements-textSecondary text-sm">кредитов</span>
              </div>
              <div>
                <p className="text-xl font-bold">{pkg.price_rub} ₽</p>
                <p className="text-bolt-elements-textSecondary text-sm">{pkg.price_stars} ⭐ Stars</p>
              </div>
              <button className="w-full py-2 rounded-xl bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor text-sm font-medium hover:bg-bolt-elements-background-depth-4 transition-all">
                Купить
              </button>
            </div>
          ))}
        </div>

        <div className="text-center text-bolt-elements-textSecondary text-sm">
          <p>Оплата через YooMoney или Telegram Stars. Кредиты зачисляются мгновенно.</p>
          <p className="mt-2">
            <Link to="/" className="text-accent hover:underline">← Вернуться в конструктор</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
