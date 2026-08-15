const TOKEN_KEY = 'token';
const AUTH_CHANGED = 'auth:changed';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

// useSyncExternalStore contract: call onChange whenever the value may have changed,
// and return a function that unsubscribes.
export function subscribeToToken(onChange: () => void): () => void {
  // Fired by setToken/clearToken in this tab.
  window.addEventListener(AUTH_CHANGED, onChange);

  // Fired by the browser when *another* tab writes to localStorage, so logging out
  // in one tab logs out the rest.
  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGED, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
