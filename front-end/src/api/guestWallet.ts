// Guest-mode stand-in for API/Controllers/WalletController.cs. Same rules: the
// wager must be a positive number, a loss can't overdraw, and a win adds the
// amount reported by the game.
const BALANCE_KEY = 'guestBalance';
const STARTING_BALANCE = 1000;

// Balances are money, so keep them to whole cents instead of letting float error
// accumulate over hundreds of bets.
const toCents = (value: number): number => Math.round(value * 100) / 100;

export function getGuestBalance(): number {
  const raw = localStorage.getItem(BALANCE_KEY);
  // Number(null) is 0, so a first visit has to be told apart from an empty wallet.
  const stored = raw === null ? NaN : Number(raw);
  return Number.isFinite(stored) ? stored : STARTING_BALANCE;
}

export function applyGuestWager(wager: string, outcome: 'win' | 'loss'): number | string {
  const amount = Number(wager);
  if (!Number.isFinite(amount)) return 'Wager must be a number';
  if (amount <= 0) return 'Wager must be greater than zero';

  const balance = getGuestBalance();
  if (outcome === 'loss' && balance < amount) return 'Insufficient balance';

  const next = toCents(outcome === 'loss' ? balance - amount : balance + amount);
  localStorage.setItem(BALANCE_KEY, next.toString());
  return next;
}
