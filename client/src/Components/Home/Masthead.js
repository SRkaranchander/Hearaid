import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ClickSpark from "../animations/ClickSpark";

// SVGs for Hand Gestures in Step 2
const WaveHandSVG = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#B895FF' }}>
    <path d="M18 10h-2V6a2 2 0 0 0-4 0v4H10V5a2 2 0 0 0-4 0v9a6 6 0 0 0 12 0v-4Z" />
    <path d="M12 2v2M5.22 5.22l1.42 1.42M2 12h2M18.78 5.22l-1.42 1.42" />
  </svg>
);

const HeartHandSVG = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9E7BFF' }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// Soundwave animation helper for Step 0
const SoundWave = () => (
  <div className="d-flex align-items-center justify-content-center gap-1" style={{ height: "40px" }}>
    {[0.6, 1.2, 0.4, 1.5, 0.9, 0.5, 1.3, 0.7].map((delay, i) => (
      <motion.div
        key={i}
        animate={{ height: ["10px", "40px", "10px"] }}
        transition={{ duration: 1.0, repeat: Infinity, delay: delay, ease: "easeInOut" }}
        style={{
          width: "4px",
          background: "linear-gradient(to top, #9E7BFF, #B895FF)",
          borderRadius: "2px"
        }}
      />
    ))}
  </div>
);

function Masthead() {
  const [step, setStep] = useState(0);

  // Auto loop the interactive demo
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stepsData = [
    {
      title: "Step 1: Listening for Speech",
      desc: "System active. Pulsing microphone captures real-time vocal waveforms.",
      component: (
        <div className="d-flex flex-column align-items-center justify-content-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "rgba(184, 149, 255, 0.15)",
              border: "2px solid #B895FF",
              boxShadow: "0 0 25px rgba(184, 149, 255, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <i className="fa-solid fa-microphone fs-3" style={{ color: "#B895FF" }}></i>
          </motion.div>
          <SoundWave />
        </div>
      )
    },
    {
      title: "Step 2: Speech Recognition",
      desc: "AI audio transcribers process inputs, turning speech directly to text.",
      component: (
        <div className="d-flex flex-column align-items-center justify-content-center gap-3 w-100 px-3">
          <div className="glass-card py-2 px-4 border-light text-start w-100" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="dot bg-cyan" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#B895FF" }}></span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Audio Input</span>
            </div>
            <motion.p
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                margin: 0
              }}
            >
              "Hello, welcome to HearAid!"
            </motion.p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Translating to ASL",
      desc: "Text triggers linguistic parsers mapping grammar to hand gestures.",
      component: (
        <div className="d-flex align-items-center justify-content-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="d-flex flex-column align-items-center gap-2"
          >
            <WaveHandSVG />
            <span style={{ fontSize: "0.8rem", color: "#B895FF" }}>Hello</span>
          </motion.div>
          <i className="fa-solid fa-arrow-right-long text-muted"></i>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="d-flex flex-column align-items-center gap-2"
          >
            <HeartHandSVG />
            <span style={{ fontSize: "0.8rem", color: "#9E7BFF" }}>Welcome</span>
          </motion.div>
        </div>
      )
    },
    {
      title: "Step 4: Translation Complete",
      desc: "Successful parse. The virtual avatar renders the ASL signs instantly.",
      component: (
        <div className="d-flex flex-column align-items-center justify-content-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(184, 149, 255, 0.15)",
              border: "2px solid #B895FF",
              boxShadow: "0 0 20px rgba(184, 149, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <i className="fa-solid fa-check fs-4" style={{ color: "#B895FF" }}></i>
          </motion.div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#B895FF", fontWeight: 700, fontSize: "1.1rem" }}>
            Translation Complete
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Signs parsed in 18ms
          </span>
        </div>
      )
    }
  ];

  return (
    <div style={{ minHeight: "92vh", display: "flex", alignItems: "center", paddingTop: "120px", paddingBottom: "80px", position: "relative" }}>
      <div className="container">
        <div className="row align-items-center justify-content-between">
          
          {/* Left Text Panel */}
          <div className="col-lg-6 mb-5 mb-lg-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Glowing Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: "30px",
                  background: "rgba(184, 149, 255, 0.08)",
                  color: "var(--text-primary)",
                  border: "1px solid rgba(184, 149, 255, 0.2)",
                  marginBottom: "24px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "0 0 15px rgba(184, 149, 255, 0.1)"
                }}
              >
                <span style={{ color: "#B895FF" }}>✦</span> AI-Powered Accessibility Platform
              </div>

              {/* Main Heading */}
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "72px",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: "24px",
                  letterSpacing: "-0.03em",
                  color: "#ffffff"
                }}
              >
                Speak.<br />
                Understand.<br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #CBA7FF, #8E67FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Connect.
                </span>
              </h1>

              {/* Subheading */}
              <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "40px", maxWidth: "620px" }}>
                HearAid translates speech into American Sign Language in real time, making communication effortless and inclusive.
              </p>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
                <ClickSpark>
                  <Link
                    to="/hearaid/convert"
                    className="btn-premium"
                    style={{ textDecoration: "none" }}
                  >
                    Start Speaking <i className="fa-solid fa-arrow-right ms-2" />
                  </Link>
                </ClickSpark>
                <ClickSpark>
                  <a
                    href="#how-it-works"
                    className="btn-premium-outline"
                  >
                    Watch Demo
                  </a>
                </ClickSpark>
              </div>

              {/* Feature Chips */}
              <div className="d-flex flex-wrap gap-2 pt-2">
                {[
                  "Real-Time Translation",
                  "AI Speech Recognition",
                  "American Sign Language",
                  "Multi-Language Support"
                ].map((chip, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3, boxShadow: "0 0 15px rgba(184, 149, 255, 0.25)" }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(184, 149, 255, 0.15)",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      cursor: "default",
                      transition: "border-color 0.3s"
                    }}
                  >
                    <i className="fa-solid fa-check" style={{ color: "#B895FF" }}></i>
                    {chip}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Demonstration Panel */}
          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div style={{ position: "relative" }}>
                {/* Background Glow */}
                <div style={{ position: "absolute", top: "10%", right: "10%", width: "100%", height: "100%", background: "radial-gradient(circle, rgba(184,149,255,0.15) 0%, rgba(184,149,255,0.05) 50%, transparent 70%)", filter: "blur(80px)", zIndex: 0, borderRadius: "50%" }}></div>

                {/* Glassmorphic Panel Container */}
                <div
                  className="glass-card"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    padding: "30px",
                    borderRadius: "26px",
                    background: "rgba(23, 20, 38, 0.72)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.45)"
                  }}
                >
                  {/* Step Header */}
                  <div className="text-center mb-4">
                    <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#ffffff", fontSize: "1.15rem", marginBottom: "8px" }}>
                      Interactive Translation Flow
                    </h4>
                    <div className="d-flex align-items-center justify-content-center gap-1.5 mb-2">
                      {[0, 1, 2, 3].map((s) => (
                        <div
                          key={s}
                          onClick={() => setStep(s)}
                          style={{
                            width: "35px",
                            height: "6px",
                            borderRadius: "3px",
                            background: step === s ? "linear-gradient(to right, #B895FF, #9E7BFF)" : "rgba(255,255,255,0.1)",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Animation Display Frame */}
                  <div
                    style={{
                      height: "170px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(5, 8, 22, 0.5)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                      marginBottom: "24px",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: "100%" }}
                      >
                        {stepsData[step].component}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Step Info */}
                  <div className="text-center">
                    <h5 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#ffffff", fontWeight: 700, fontSize: "1.05rem", marginBottom: "6px" }}>
                      {stepsData[step].title}
                    </h5>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.4, margin: 0 }}>
                      {stepsData[step].desc}
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Masthead;
