import logo from "../assets/logo.webp";
import logo_avatar from "../assets/LOGO.svg"
import meowspaceLogo from "../assets/MSlogo.svg"; // Add this line
import "./Sponsor.css";

export default function Sponsor() {

  return (
    <main className="sponsor-page">
      <div className="sponsor-page__container">
        <div className="sponsor-page__content">
          <img src={logo} alt="Sponsor Logo" className="sponsor-page__logo" />


          {/* CREATORS TAB */}
          <section className="creators-section">
            <h2 className="creators-section__title">Meet Our Creators</h2>
            <div className="creators-grid">
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Aleksas Vėbra</h3>
                  <p className="creator-card__role">Back End</p>
                </div>
              </div>
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Atlantas Ališauskas</h3>
                  <p className="creator-card__role">Full Stack</p>
                </div>
              </div>
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Ditas Šimoliūnas</h3>
                  <p className="creator-card__role">Front End, Designer, Documentation</p>
                </div>
              </div>
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Jakub Rogoža</h3>
                  <p className="creator-card__role">Full Stack, Design lead, Manager, Documentation</p>
                </div>
              </div>
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Jonas Salys</h3>
                  <p className="creator-card__role">Front End</p>
                </div>
              </div>
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Kasparas Steponkevičius</h3>
                  <p className="creator-card__role">Documentation</p>
                </div>
              </div>
              <div className="creator-card">
                <div className="creator-card__avatar">
                    <img src={logo_avatar} alt="Kasparas Steponkevičius" className="creator-card__avatar-img" />
                </div>
                <div className="creator-card__info">
                  <h3 className="creator-card__name">Nerijus Ponomariovas</h3>
                  <p className="creator-card__role">Front End</p>
                </div>
              </div>
            </div>
          </section>

          <div className="sponsor-page__description">
            <p>
              Thank you to our amazing creators for bringing Cataris to life!
              Your creativity and dedication make our gaming experiences possible.
            </p>

          </div>

          {/* SPONSOR MEOWSPACE */}
          <section className="meowspace-sponsor">
            <h3 className="meowspace-sponsor__title">Sponsored by:</h3>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="meowspace-sponsor__link"
            >
              <div className="meowspace-sponsor__content">
                <img 
                  src={meowspaceLogo} 
                  alt="MeowSpace Logo" 
                  className="meowspace-sponsor__logo" 
                />
                <span className="meowspace-sponsor__brand-text">MeowSpace</span>
              </div>
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}