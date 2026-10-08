import React, { useEffect } from "react";
import Services from "../Components/Home/Services";
import Intro from "../Components/Home/Intro";
import Masthead from "../Components/Home/Masthead";
import Stats from "../Components/Home/Stats";
import { Link } from "react-router-dom";
import ClickSpark from "../Components/animations/ClickSpark";

function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="main-content">
      <Masthead />
      <Stats />
      <Intro />
      <Services />

      <section style={{ padding: '120px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
        {/* Soft backglow */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0, 229, 255, 0.06) 0%, transparent 60%)", filter: "blur(100px)", zIndex: 0, transform: "translate(-50%, -50%)" }}></div>
        
        <div className="container text-center" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: '#ffffff' }}>
            Ready to <span style={{ background: "linear-gradient(to right, #CBA7FF, #8E67FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Bridge the Gap?</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 40px' }}>
            Join thousands of users discovering a robust, accessible world with our premier American Sign Language toolkit.
          </p>
          <ClickSpark>
            <Link 
              to="/hearaid/login" 
              className="btn-premium"
              style={{ textDecoration: 'none' }}
            >
              Create an Account Now
            </Link>
          </ClickSpark>
        </div>
      </section>
    </div>
  );
}

export default Home;
