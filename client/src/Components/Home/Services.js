import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ClickSpark from "../animations/ClickSpark";

export default function Services() {
  const features = [
    {
      title: "Speech Recognition",
      desc: "Captures and transcribes vocal statements in real time. Neural transcriptions support multiple local languages and dialects.",
      icon: "fa-solid fa-microphone-lines",
      color: "#CDBBFF",
      link: "/hearaid/convert"
    },
    {
      title: "AI Processing",
      desc: "Linguistically transforms English input structure into standardized American Sign Language sentence representations.",
      icon: "fa-solid fa-brain",
      color: "#B895FF",
      link: "/hearaid/alphabet-syllabus"
    },
    {
      title: "ASL Avatar",
      desc: "Generates fluid virtual hand models and shapes corresponding to sign language alphabets and conversational words.",
      icon: "fa-solid fa-child-reaching",
      color: "#9E7BFF",
      link: "/hearaid/learn-sign"
    }
  ];

  return (
    <section id="features" style={{ padding: "100px 0", position: "relative" }}>
      {/* Background glow overlay */}
      <div style={{ position: "absolute", right: 0, bottom: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(184, 149, 255, 0.08) 0%, transparent 70%)", filter: "blur(120px)", zIndex: 0 }}></div>

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
            Capabilities
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#ffffff" }}>
            Core <span style={{ background: "linear-gradient(to right, #B895FF, #9E7BFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Features</span>
          </h2>
          <div style={{ width: "60px", height: "4px", background: "linear-gradient(to right, #B895FF, #9E7BFF)", margin: "0 auto 20px", borderRadius: "2px" }}></div>
        </div>

        {/* Feature Cards Grid */}
        <div className="row g-4 pt-4">
          {features.map((feat, index) => (
            <div className="col-lg-4" key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ 
                  y: -6,
                  boxShadow: `0 10px 40px rgba(0, 0, 0, 0.45), 0 0 25px rgba(${feat.color === "#CDBBFF" ? "205,187,255" : feat.color === "#B895FF" ? "184,149,255" : "158,123,255"}, 0.15)`
                }}
                className="glass-card h-100 d-flex flex-column"
                style={{
                  padding: "32px",
                  borderRadius: "26px",
                  background: "rgba(23, 20, 38, 0.72)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Icon Circle */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: `rgba(${feat.color === "#CDBBFF" ? "205,187,255" : feat.color === "#B895FF" ? "184,149,255" : "158,123,255"}, 0.1)`,
                    border: `1px solid rgba(${feat.color === "#CDBBFF" ? "205,187,255" : feat.color === "#B895FF" ? "184,149,255" : "158,123,255"}, 0.2)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "28px"
                  }}
                >
                  <i className={`${feat.icon} fs-3`} style={{ color: feat.color }}></i>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", marginBottom: "16px" }}>
                  {feat.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "30px", flexGrow: 1 }}>
                  {feat.desc}
                </p>

                {/* Card Action Button */}
                <ClickSpark style={{ display: 'block', width: '100%', marginTop: 'auto' }}>
                  <Link
                    to={feat.link}
                    className="d-flex align-items-center justify-content-between p-3"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-light)",
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      transition: "all 0.3s ease",
                      width: "100%"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(184, 149, 255, 0.15)";
                      e.currentTarget.style.borderColor = "#B895FF";
                      e.currentTarget.style.color = "#B895FF";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                  >
                    Launch Service <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.75rem" }}></i>
                  </Link>
                </ClickSpark>

              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
