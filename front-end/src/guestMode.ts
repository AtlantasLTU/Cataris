// Static hosting (Netlify) has no API or database behind it, so the site is built
// with VITE_GUEST_MODE=true: there are no accounts, every visitor is treated as a
// logged-in guest, and the wallet lives in this browser's localStorage instead.
export const GUEST_MODE = import.meta.env.VITE_GUEST_MODE === 'true';
