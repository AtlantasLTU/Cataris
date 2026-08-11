import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './promotion.css';
import Login from "./Login";
import Register from "./Register";


// Promotion images
import promo1 from '../assets/Promotion/1st-promotion.png';
import promo2 from '../assets/Promotion/2nd-promotion.png';
import promo3 from '../assets/Promotion/3rd-promotion.png';
import promo4 from '../assets/Promotion/4th-promotion.png';
import promo5 from '../assets/Promotion/5th-promotion.png';
import banner from '../assets/Promotion/promotion-banner.png';

interface Promotion {
  id: number;
  title: string;
  description: string;
  endTime: string;
  imageUrl: string;
}

const promotionsData: Promotion[] = [
  {
    id: 1,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet accumsan pretium.',
    description: 'Share in 50,000$!',
    endTime: '00.01AM 01/15/2026',
    imageUrl: promo1
  },
  {
    id: 2,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet accumsan pretium.',
    description: '10,000$ Prize Pool!',
    endTime: '2:00AM 12/24/2025',
    imageUrl: promo2
  },
  {
    id: 3,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet accumsan pretium.',
    description: 'Win your share 7$',
    endTime: '2:59PM 12/29/2025',
    imageUrl: promo3
  },
  {
    id: 4,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet accumsan pretium.',
    description: '50,000$ Prize Pool!',
    endTime: '10:PM 05/13/2026',
    imageUrl: promo4
  },
  {
    id: 5,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet accumsan pretium.',
    description: 'Win biggest jackpot',
    endTime: '6:30AM 11/03/2026',
    imageUrl: promo5
  }
];

export default function Promotions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  useEffect(() => {
    const auth = searchParams.get("auth");
    setShowLogin(auth === "login");
    setShowRegister(auth === "register");
  }, [searchParams]);
  const closeAuthModal = () => {
    setShowLogin(false);
    setShowRegister(false);
    navigate("/promotions", { replace: true }); // clears ?auth=...
  };
  return (
    <main className="promotions">
      {/* BANNER */}
      <div className="promotions__banner">
        <img src={banner} alt="" />
      </div>

      {/* PROMOTION CARDS */}
      <section className="promotions__content">
        <div className="promotions__grid">
          {promotionsData.map((promo) => (
            <div key={promo.id} className="promocard">
              <div className="promocard__img">
                <img 
                  src={promo.imageUrl} 
                  alt={promo.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="200"%3E%3Crect fill="%23234567" width="280" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="16" font-family="Arial"%3EPromo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              
              <div className="promocard__body">
                <h3 className="promocard__title">{promo.title}</h3>
                <p className="promocard__desc">{promo.description}</p>
                
                <div className="promocard__footer">
                  <span className="promocard__label">Ends at</span>
                  <span className="promocard__time">{promo.endTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">×</button>
            <Login />
          </div> 
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
          <div className="modal__backdrop" onClick={closeAuthModal} />
          <div className="modal__panel">
            <button className="modal__close" onClick={closeAuthModal} aria-label="Close">×</button>
            <Register />
          </div>
        </div>
      )}
    </main>
  );
}