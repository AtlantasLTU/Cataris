import { useSyncExternalStore } from 'react';
import { getToken, subscribeToToken } from '../auth/tokenStore';

// Replaces the `const [isAuthenticated, setIsAuthenticated] = useState(false)` +
// `useEffect(() => setIsAuthenticated(!!localStorage.getItem("token")), [])` pair
// that was copy-pasted across seven components.
//
// Reading during render instead of writing state in an effect means the first
// render already has the right value -- the old version always rendered once as
// logged-out before the effect corrected it.

export function useToken(): string | null {
  // getToken returns a string or null. Primitives compare by value, so this
  // satisfies useSyncExternalStore's requirement that repeated calls with an
  // unchanged store return an identical snapshot.
  return useSyncExternalStore(subscribeToToken, getToken);
}

export function useIsAuthenticated(): boolean {
  return useToken() !== null;
}
