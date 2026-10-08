import React from "react";
import { motion } from "framer-motion";

function Feedback() {
  const forms = [
    { title: "Feedback on Overall Website", text: "Tell us what you think about the overall webapp design. Rate our webpage on various metrics like satisfaction, appearance, usability etc.", link: "https://docs.google.com/forms/d/e/1FAIpQLSf1yDHIBGR2EusbGSuk-zBWBwoS5i-Gwm7Rvprw6IhBlWfJTQ/viewform?usp=sf_link" },
    { title: "Feedback on Audio to Sign Module", text: "Help us to know how well our system is able to understand and convert different voices and accents to text so that the correct sign is displayed everytime.", link: "https://docs.google.com/forms/d/e/1FAIpQLSehlA48o3Y_k9ntfHRzY5II6iqhlpaP2iALN7h1sTjYn7Nr4w/viewform?usp=sf_link" },
    { title: "Feedback on Sign Correctness (For Expert users)", text: "Expert users who are well versed in American Sign Language can help us by telling if the animated signs displayed on theis webapp are correct or not.", link: "https://docs.google.com/forms/d/e/1FAIpQLScDfQ-6EbKgG-nLdjTI7atlA65EnWoQb3mOo3Bl-JtpNhjJuA/viewform?usp=sf_link" },
    { title: "Feedback on Sign Correctness (For Novice users)", text: "Novice users who may not know American Sign Language can help us by rating the similarity of our animated signs with real life recorded signs.", link: "https://docs.google.com/forms/d/e/1FAIpQLScEHG6UoqUwhoqzE_KNrLXAMOkSb8xKfSJNRCn52gmF9ksRkw/viewform?usp=sf_link" },
    { title: "Feedback on 'Create Video' module", text: "Help us know if our ASL Video creation module is simple and easy enough to use. Let us know if you want any more features to be added in this module.", link: "https://docs.google.com/forms/d/e/1FAIpQLScScSh9Mli_1XKQLmNBrCGkWve7jbMqMwHhpiNS-qeNNXgKMA/viewform?usp=sf_link" }
  ];

  return (
    <div className="main-content" style={{ padding: '60px 20px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '20%', width: '600px', height: '600px', background: 'var(--accent-purple)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1000px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--accent-glow)', color: 'var(--text-primary)', fontSize: '2rem' }}>
            <i className="fa-solid fa-comment-dots" />
          </div>
          <h2 className="heading-lg mb-3">
            <span className="text-gradient">Give Your Feedback!</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Help us improve our webapp by providing your valuable feedback. Your feedback will be used to improve the UI/UX so we can provide the best possible service to you!
          </p>
        </motion.div>

        <div className="row g-4 justify-content-center">
          {forms.map((f, i) => (
            <div key={i} className="col-md-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-hover)' }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)' }}>HearAid: Feedback Form {i + 1}</div>
                  </div>
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h5 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{f.title}</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>{f.text}</p>
                    <a target="_blank" rel="noreferrer" href={f.link} className="btn-premium w-100" style={{ marginTop: '20px', textDecoration: 'none', textAlign: 'center' }}>
                      <i className="fa-solid fa-arrow-up-right-from-square me-2" /> Open Form
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
