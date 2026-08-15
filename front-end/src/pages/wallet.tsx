import { useEffect, useMemo, useState } from "react";
import { updateWalletBalance, fetchUserInfo, fetchWalletBalance, updateUserInfo } from "../api/auth";
import Login from "./Login";
import Register from "./Register";
import logo from "../assets/LOGO.svg";
import { useAuthModal } from "../hooks/useAuthModal";
import { useIsAuthenticated } from "../hooks/useAuth";
import { useBalance } from "../hooks/useBalance";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Wallet() {
  const isAuthenticated = useIsAuthenticated();
  const { balance: accountBalance } = useBalance();
  const [loading, setLoading] = useState<boolean>(false); // For button loading state
  const [saving, setSaving] = useState<boolean>(false);
  const { showLogin, showRegister, closeAuthModal } = useAuthModal("/wallet");
  const [username, setUsername] = useState<string>("-");
  const [email, setEmail] = useState<string>("-");
  const [editUsername, setEditUsername] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const getUserInfo = async () => {
    const result = await fetchUserInfo();
    if ("username" in result) {
      setUsername(result.username);
      setEmail(result.email);

      setEditEmail(result.email ?? "");
      setEditUsername(result.username ?? "");
    } else {
      console.error("Failed to fetch user info:", result.message);
    }
  };
  const hasChanges = useMemo(() => {
    return editUsername.trim() !== (username ?? "").trim() || editEmail.trim() !== (email ?? "").trim();
  }, [editUsername, editEmail, username, email]);

  // Initialize cooldown from localStorage
  const [depositCooldown, setDepositCooldown] = useState<number>(() => {
    const stored = localStorage.getItem("depositCooldown");
    if (!stored) return 0;
    return Math.max(0, Math.ceil((parseInt(stored, 10) - Date.now()) / 1000));
  });

  // Countdown timer effect
  useEffect(() => {
    if (depositCooldown > 0) {
      const timer = setInterval(() => {
        setDepositCooldown(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            localStorage.removeItem("depositCooldown");
            return 0;
          }
          return newValue;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [depositCooldown]);

  const handleDeposit = async () => {
    console.log("Pressed");
    setLoading(true);
    try {
      await updateWalletBalance("50", "win");
      const result = await fetchWalletBalance();
      if ('balance' in result) {
        console.log("New balance: ", result.balance);
        // Set 5-minute cooldown (300 seconds)
        const cooldownEnd = Date.now() + (5 * 60 * 1000);
        localStorage.setItem("depositCooldown", cooldownEnd.toString());
        setDepositCooldown(300);
      }
      else {
        console.error("Deposit failed:", result.message);
      }
      //window.location.reload();
    } catch (error) {
      console.error("Deposit failed: ", error);
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event("balance:refresh"));
    }
  };

  const handleSaveUserInfo = async () => {
    setSaveSuccess(null);

    const nextUsername = editUsername.trim();
    const nextEmail = editEmail.trim();

    if (!nextUsername && !nextEmail) {
      console.error("Nothing to update.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateUserInfo(nextUsername, nextEmail);

      if (!("type" in result)) {
        setSaveSuccess(result.message || "Saved.");
        await getUserInfo(); // source of truth
      } else {
        console.error("Save failed:")
      }
    } catch (e) {
      console.error("Save failed:", e)
    } finally {
      setSaving(false);
    }
  };
  const handleReset = () => {
    setSaveSuccess(null);
    setEditUsername(username === "-" ? "" : username);
    setEditEmail(email === "-" ? "" : email);
  };

  const isEmailValid = useMemo(() => {
    if (!editEmail.trim()) return true;
    return emailRegex.test(editEmail.trim());
  }, [editEmail]);

  return (
    <main className="min-h-screen bg-linear-to-b from-[#0a2e5c] via-[#0b3a6f] to-[#081c36] text-white p-5 overflow-x-hidden">
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-linear-to-b from-[#102c56] via-[#0b3a6f] to-[#081c36] bg-opacity-100 z-10 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-11/12 sm:w-96 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-16 h-auto"
                />
                <p className="text-xl ml-4 text-gray-700">Please log in</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto p-5">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#dbeafe]">
            Account
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[#0f2a44] rounded-xl p-6 mb-6 shadow-xl">
          <div className="py-4 border-b border-[#1e4f8f]">
            <span className="text-sm text-[#7fb3ff]">Username</span>
            <div className="text-lg font-semibold text-white">
              {username}
            </div>
          </div>

          <div className="py-4 border-b border-[#1e4f8f]">
            <span className="text-sm text-[#7fb3ff]">Email</span>
            <div className="text-lg font-semibold text-white">
              {email}
            </div>
          </div>

          <div className="pt-4">
            <span className="text-sm text-[#7fb3ff]">Wallet</span>
            <div className="text-2xl font-bold text-[#4da3ff]">
              {accountBalance !== null ? `$${accountBalance.toFixed(2)}` : 'Loading...'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => void handleDeposit()}
          disabled={loading || depositCooldown > 0}
          className={`w-full py-4 rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            loading || depositCooldown > 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}>
          {loading ? "Processing..." : depositCooldown > 0 ? `Deposit (${Math.floor(depositCooldown / 60)}:${(depositCooldown % 60).toString().padStart(2, '0')})` : `Deposit`}
        </button>
      </div>
      <aside className="max-w-2xl mx-auto p-5">

        <h2 className="text-xl font-semibold text-[#dbeafe] mb-4">Edit profile</h2>
        <div className="bg-[#0f2a44] rounded-xl p-6 mb-6 shadow-xl">
          <label className="block text-sm text-[#7fb3ff] mb-1">Username</label>
          <input
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0b1f33] border border-[#1e4f8f] text-white outline-none focus:border-blue-400"
            placeholder="Enter username"
          />

          <label className="block text-sm text-[#7fb3ff] mb-1">Email</label>
          <input
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0b1f33] border border-[#1e4f8f] text-white outline-none focus:border-blue-400"
            placeholder="Enter email"
          />
          {saveSuccess && (
            <div className="mb-3 text-sm text-green-300 bg-green-900/20 border border-green-600/30 rounded-lg p-2">
              {saveSuccess}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void handleSaveUserInfo()}
            disabled={saving || !hasChanges || !isEmailValid}
            className="flex-1 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="py-3 px-4 bg-[#0b1f33] border border-[#1e4f8f] rounded-lg font-semibold hover:bg-[#0e2b45] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-[#7fb3ff] mt-3 opacity-80">
          Changes are applied after confirmation and reloaded from backend.
        </p>
      </aside>
      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">
              ×
            </button>
            <Login />
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">
              ×
            </button>
            <Register />
          </div>
        </div>
      )}
    </main>
  );
}
