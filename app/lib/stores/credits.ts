import { atom } from 'nanostores';

export interface CreditsState {
  credits: number;
  tier: string;
  loaded: boolean;
}

export const creditsStore = atom<CreditsState>({
  credits: 0,
  tier: 'free',
  loaded: false,
});

export async function loadCredits() {
  try {
    const res = await fetch('/api/credits');
    if (!res.ok) return;
    const data = await res.json() as { credits: number; tier: string };
    creditsStore.set({ credits: data.credits, tier: data.tier, loaded: true });
  } catch {
    // ignore
  }
}

export function decrementCredits() {
  const state = creditsStore.get();
  if (state.credits > 0) {
    creditsStore.set({ ...state, credits: state.credits - 1 });
  }
}
