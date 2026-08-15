
import './Games.css';
import Login from "./Login";
import Register from "./Register";
import logo from "../assets/LOGO.svg"
import { useAuthModal } from '../hooks/useAuthModal';


export default function Games() {
    const { showLogin, showRegister, closeAuthModal } = useAuthModal("/games/roulette");
    return (
        <main className="home flow">
            <div className="fixed inset-0 bg-linear-to-b from-[#102c56] via-[#0b3a6f] to-[#081c36] z-10 flex items-center justify-center">
                <div className="bg-white px-10 py-6 rounded-xl shadow-xl">
                    <div className="flex items-center justify-center gap-4">

                        <img
                            src={logo}
                            alt="Logo"
                            className="w-16 h-auto" // Adjust the size of your logo
                        />
                        <p className="text-xl font-semibold text-gray-700">Coming soon!</p>
                    </div>
                </div>
            </div>
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
};