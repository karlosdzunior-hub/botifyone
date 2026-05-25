import fs from 'fs';
import path from 'path';

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'botify.json');

export interface DbUser {
  user_id: string;
  credits: number;
  tier: string;
  tier_expires_at: number | null;
  created_at: number;
}

export interface DbTransaction {
  id: number;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: number;
}

interface DbData {
  users: Record<string, DbUser>;
  transactions: DbTransaction[];
  next_tx_id: number;
}

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}

export function readDb(): DbData {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    return { users: {}, transactions: [], next_tx_id: 1 };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { users: {}, transactions: [], next_tx_id: 1 };
  }
}

export function writeDb(data: DbData): void {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}
