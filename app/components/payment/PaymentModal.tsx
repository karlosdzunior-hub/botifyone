import React, { useState } from 'react';
import { CREDIT_PACKAGES, TIER_PLANS } from '~/lib/constants/plans';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'packages' | 'plans';
}

export function PaymentModal({ isOpen, onClose, defaultTab = 'packages' }: PaymentModalProps) {
  const [tab, setTab] = useState<'packages' | 'plans'>(defaultTab);
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const isTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp?.initData;

  async function handlePay(type: 'package' | 'plan', itemId: string, method: 'yoomoney' | 'stars') {
    const key = `${type}-${itemId}-${method}`;
    setLoading(key);

    try {
      const endpoint = method === 'yoomoney' ? '/api/payment/yoomoney' : '/api/payment/stars';
      const res = await fetch(`${endpoint}?type=${type}&item=${itemId}`);
      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        alert(data.error || 'Ошибка создания платежа');
        return;
      }

      if (method === 'stars' && isTelegram) {
        (window as any).Telegram.WebApp.openInvoice(data.url, (status: string) => {
          if (status === 'paid') {
            onClose();
            window.location.reload();
          }
        });
      } else {
        window.open(data.url, '_blank');
        onClose();
      }
    } catch {
      alert('Ошибка соединения. Попробуйте позже.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-bolt-elements-background-depth-1 rounded-t-3xl sm:rounded-2xl border border-bolt-elements-borderColor shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-bolt-elements-borderColor shrink-0">
          <h2 className="text-lg font-bold">Пополнить баланс</h2>
          <button onClick={onClose} className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary p-1 rounded-lg transition-colors">
            <div className="i-ph:x text-xl" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4 pb-2 shrink-0">
          <button
            onClick={() => setTab('packages')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'packages' ? 'bg-accent text-white' : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'}`}
          >
            Кредиты
          </button>
          <button
            onClick={() => setTab('plans')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'plans' ? 'bg-accent text-white' : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'}`}
          >
            Подписки
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-5 pt-2 space-y-3">
          {tab === 'packages' &&
            CREDIT_PACKAGES.map((pkg) => {
              const keyYoo = `package-${pkg.id}-yoomoney`;
              const keyStars = `package-${pkg.id}-stars`;
              return (
                <div key={pkg.id} className="rounded-2xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="i-ph:lightning-fill text-accent text-lg" />
                      <span className="font-bold text-lg">{pkg.credits} кредитов</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{pkg.price_rub} ₽</p>
                      <p className="text-xs text-bolt-elements-textSecondary">{pkg.price_stars} ⭐</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePay('package', pkg.id, 'yoomoney')}
                      disabled={!!loading}
                      className="flex-1 py-2 rounded-xl bg-[#8B3FFD] text-white text-sm font-medium hover:bg-[#7B2FFD] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loading === keyYoo ? <span className="i-ph:spinner-gap-bold animate-spin text-base" /> : null}
                      YooMoney
                    </button>
                    <button
                      onClick={() => handlePay('package', pkg.id, 'stars')}
                      disabled={!!loading}
                      className="flex-1 py-2 rounded-xl bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1A8EC0] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loading === keyStars ? <span className="i-ph:spinner-gap-bold animate-spin text-base" /> : null}
                      ⭐ Stars
                    </button>
                  </div>
                </div>
              );
            })}

          {tab === 'plans' &&
            TIER_PLANS.filter((p) => p.price_rub > 0).map((plan) => {
              const keyYoo = `plan-${plan.id}-yoomoney`;
              const keyStars = `plan-${plan.id}-stars`;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-4 ${plan.popular ? 'border-accent bg-accent/5' : 'border-bolt-elements-borderColor bg-bolt-elements-background-depth-2'}`}
                >
                  {plan.popular && (
                    <span className="inline-block bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      Популярный
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold">{plan.name}</p>
                      <p className="text-sm text-bolt-elements-textSecondary">{plan.credits_label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{plan.price_rub} ₽<span className="text-xs font-normal text-bolt-elements-textSecondary">/мес</span></p>
                      <p className="text-xs text-bolt-elements-textSecondary">{plan.price_stars} ⭐/мес</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePay('plan', plan.id, 'yoomoney')}
                      disabled={!!loading}
                      className="flex-1 py-2 rounded-xl bg-[#8B3FFD] text-white text-sm font-medium hover:bg-[#7B2FFD] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loading === keyYoo ? <span className="i-ph:spinner-gap-bold animate-spin text-base" /> : null}
                      YooMoney
                    </button>
                    <button
                      onClick={() => handlePay('plan', plan.id, 'stars')}
                      disabled={!!loading}
                      className="flex-1 py-2 rounded-xl bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1A8EC0] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loading === keyStars ? <span className="i-ph:spinner-gap-bold animate-spin text-base" /> : null}
                      ⭐ Stars
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
