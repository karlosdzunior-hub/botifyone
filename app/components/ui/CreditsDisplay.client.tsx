import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { creditsStore, loadCredits } from '~/lib/stores/credits';
import { useNavigate } from '@remix-run/react';

export function CreditsDisplay() {
  const { credits, tier, loaded } = useStore(creditsStore);
  const navigate = useNavigate();

  useEffect(() => {
    loadCredits();
  }, []);

  if (!loaded) return null;

  const isLow = credits <= 3;
  const isEmpty = credits === 0;

  return (
    <button
      onClick={() => navigate('/pricing')}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 border cursor-pointer
        ${isEmpty
          ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
          : isLow
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
            : 'bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:border-bolt-elements-borderColorActive'
        }
      `}
      title="Кредиты — нажми чтобы пополнить"
    >
      <span className="i-ph:lightning-fill text-base" />
      <span>{credits}</span>
      {isEmpty && <span className="hidden sm:inline">Пополнить</span>}
    </button>
  );
}
