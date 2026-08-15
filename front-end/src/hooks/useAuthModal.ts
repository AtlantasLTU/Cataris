import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function useAuthModal(returnTo: string) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = searchParams.get("auth");
  const closeAuthModal = useCallback(() => {
    void navigate(returnTo, { replace: true }); // clears ?auth=...
  }, [navigate, returnTo]);
  return { showLogin: auth === "login", showRegister: auth === "register", closeAuthModal };
}