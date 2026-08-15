import { useCallback, useEffect, useState } from 'react';
import { fetchWalletBalance } from '../api/auth';
import { useToken } from './useAuth';

const BALANCE_REFRESH = 'balance:refresh';

// Tell every mounted useBalance() to re-fetch. Call this after a wager settles.
export function refreshBalance(): void {
  window.dispatchEvent(new Event(BALANCE_REFRESH));
}

// null means "not loaded yet or not logged in" -- the same convention Navbar and
// wallet already use to show 'Loading...'. Game pages that want a number can do
// `balance ?? 0`.
export function useBalance(): { balance: number | null; reload: () => Promise<void> } {
  const token = useToken();
  const [balance, setBalance] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setBalance(null);
      return;
    }
    const result = await fetchWalletBalance();
    if ('balance' in result) {
      setBalance(parseFloat(result.balance.toFixed(2)));
    } else {
      console.error('Failed to fetch wallet balance:', result.message);
    }
  }, [token]);

  useEffect(() => {
    void reload();
    const onRefresh = () => void reload();
    window.addEventListener(BALANCE_REFRESH, onRefresh);
    return () => window.removeEventListener(BALANCE_REFRESH, onRefresh);
  }, [reload]);

  return { balance, reload };
}
