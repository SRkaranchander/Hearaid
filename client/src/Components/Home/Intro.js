import React from "react";
import { motion } from "framer-motion";

export default function Intro() {
  const steps = [
    { number: "01", title: "Speak", desc: "User speaks or types the sentence in English." },
    { number: "02", title: "AI Recognition", desc: "Speech recognition converts the voice audio into processed text." },
    { number: "03", title: "AI Processing", desc: "Text is parsed using American Sign Language grammar rules." },
    { number: "04", title: "ASL Generation", desc: "Linguistic mappings trigger real-time gesture animations." },
    { number: "05", title: "Complete", desc: "Seamless communication bridge built between both sides." }
  ];

  return (
    <section id="how-it-works" style={{ padding: "100px 0", position: "relative" }}>
      {/* Glow effect */}
      <div style={{ position: "absolute", left: 0, top: "20%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }}></div>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="text-center mb-5">
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(184, 149, 255, 0.08)",
              border: "1px solid rgba(184, 149, 255, 0.2)",
              color: "#B895FF",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px"
            }}
          >
            Pipeline
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#ffffff" }}>
            How It <span style={{ background: "linear-gradient(to right, #B895FF, #9E7BFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Works</span>
          </h2>
          <div style={{ width: "60px", height: "4px", background: "linear-gradient(to right, #B895FF, #9E7BFF)", margin: "0 auto 20px", borderRadius: "2px" }}></div>
        </div>

        {/* Timeline Grid */}
        <div className="row g-4 pt-4">
          {steps.map((step, index) => (
            <div className="col-md-6 col-lg" key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="glass-card h-100 d-flex flex-column"
                style={{
                  padding: "32px 24px",
                  borderRadius: "26px",
                  background: "rgba(23, 20, 38, 0.72)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  position: "relative",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.45)"
                }}
              >
                {/* Connector Line for Desktop */}
                {index < steps.length - 1 && (
                  <div
                    className="d-none d-lg-block"
                    style={{
                      position: "absolute",
                      right: "-15%",
                      top: "40px",
                      width: "30%",
                      height: "2px",
                      background: "linear-gradient(to right, rgba(184, 149, 255, 0.2), rgba(158, 123, 255, 0.2))",
                      zIndex: -1
                    }}
                  />
                )}

                {/* Step Circle */}
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    background: "rgba(184, 149, 255, 0.08)",
                    border: "1px solid #B895FF",
                    boxShadow: "0 0 15px rgba(184, 149, 255, 0.25)",
                    color: "#B895FF",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px"
                  }}
                >
                  {step.number}
                </div>

                {/* Step Content */}
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#ffffff", fontWeight: 700, fontSize: "1.2rem", marginBottom: "12px" }}>
                  {step.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>

              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
