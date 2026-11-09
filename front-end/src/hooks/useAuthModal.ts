import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GUEST_MODE } from "../guestMode";

export function useAuthModal(returnTo: string) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // No accounts in guest mode, so a stray ?auth=login link opens nothing.
  const auth = GUEST_MODE ? null : searchParams.get("auth");
  const closeAuthModal = useCallback(() => {
    void navigate(returnTo, { replace: true }); // clears ?auth=...
  }, [navigate, returnTo]);
  return { showLogin: auth === "login", showRegister: auth === "register", closeAuthModal };
}