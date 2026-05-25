import { readDb, writeDb, type DbUser } from './database.server';

export type { DbUser as UserRecord };

export function getOrCreateUser(userId: string): DbUser {
  const db = readDb();

  if (db.users[userId]) return db.users[userId];

  const now = Math.floor(Date.now() / 1000);
  const newUser: DbUser = {
    user_id: userId,
    credits: 10,
    tier: 'free',
    tier_expires_at: null,
    created_at: now,
  };
  db.users[userId] = newUser;
  db.transactions.push({
    id: db.next_tx_id++,
    user_id: userId,
    amount: 10,
    type: 'bonus',
    description: 'Приветственные кредиты',
    created_at: now,
  });
  writeDb(db);
  return newUser;
}

export function getCredits(userId: string): number {
  const db = readDb();
  return db.users[userId]?.credits ?? 0;
}

export function deductCredit(userId: string): { success: boolean; creditsLeft: number } {
  const db = readDb();
  const user = db.users[userId];
  if (!user || user.credits <= 0) return { success: false, creditsLeft: 0 };

  user.credits -= 1;
  const now = Math.floor(Date.now() / 1000);
  db.transactions.push({
    id: db.next_tx_id++,
    user_id: userId,
    amount: -1,
    type: 'usage',
    description: 'AI генерация',
    created_at: now,
  });
  writeDb(db);
  return { success: true, creditsLeft: user.credits };
}

export function addCredits(userId: string, amount: number, description: string): number {
  const db = readDb();
  if (!db.users[userId]) getOrCreateUser(userId);
  const user = db.users[userId];
  user.credits += amount;
  db.transactions.push({
    id: db.next_tx_id++,
    user_id: userId,
    amount,
    type: 'purchase',
    description,
    created_at: Math.floor(Date.now() / 1000),
  });
  writeDb(db);
  return user.credits;
}

export function setTier(userId: string, tier: string, daysValid: number): void {
  const db = readDb();
  if (!db.users[userId]) getOrCreateUser(userId);
  const user = db.users[userId];
  user.tier = tier;
  user.tier_expires_at = Math.floor(Date.now() / 1000) + daysValid * 86400;
  writeDb(db);
}

export { TIER_MONTHLY_CREDITS, CREDIT_PACKAGES, TIER_PLANS } from '~/lib/constants/plans';
