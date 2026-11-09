import { useNavigate, useSearchParams } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import { GUEST_MODE } from "../guestMode";

export default function AuthModal() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const a = params.get("auth");
  const auth = a === "login" || a === "register" ? a : null;

  if (!auth || GUEST_MODE) return null;

  const close = () => {
    void navigate(".", { replace: true });
  };

  return (
    <div className="auth-modal-backdrop" onClick={close}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={close}>×</button>
        {auth === "login" ? <Login /> : <Register />}
      </div>
    </div>
  );
}