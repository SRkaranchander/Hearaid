import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const AnimatedNumber = ({ value, duration = 1.5, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (!inView) return;

    // Parse value (extract numbers)
    const target = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(target)) {
      setCount(value);
      return;
    }

    let start = 0;
    const end = target;
    const stepTime = Math.abs(Math.floor(duration * 1000 / end));
    
    // Safety cap to prevent browser locking for large numbers
    const increment = Math.max(1, Math.floor(end / 60));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, Math.min(stepTime * increment, 30));

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {typeof count === "number" ? count : value}
      {suffix}
    </span>
  );
};

export default function Stats() {
  const statsData = [
    { value: "98", suffix: "%", label: "Translation Accuracy", desc: "SOTA accuracy score in gesture mapping benchmarks." },
    { value: "10", suffix: "+", label: "Supported Languages", desc: "Translating regional dialects into unified signs." },
    { value: "Real-Time", suffix: "", label: "Processing Speed", desc: "Sub-50ms processing pipeline for seamless flow." },
    { value: "24/7", suffix: "", label: "Accessibility Support", desc: "Available instantly, everywhere across devices." }
  ];

  return (
    <section style={{ padding: "80px 0", position: "relative" }}>
      <div className="container">
        <div 
          className="glass-card" 
          style={{ 
            background: "rgba(23, 20, 38, 0.72)", 
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "26px",
            padding: "32px"
          }}
        >
          <div className="row g-0 text-center">
            {statsData.map((stat, i) => (
              <div 
                className="col-md-6 col-lg-3" 
                key={i}
                style={{
                  borderRight: i < statsData.length - 1 ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                  borderBottom: "none",
                  padding: "20px 10px"
                }}
              >
                <div>
                  <h3 
                    style={{ 
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "64px", 
                      fontWeight: 800, 
                      marginBottom: "8px",
                      background: "linear-gradient(135deg, #CBA7FF 0%, #8E67FF 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    {/* Animated count up for numerical entries, else static string */}
                    {["98", "10"].includes(stat.value) ? (
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    ) : (
                      <span>{stat.value}{stat.suffix}</span>
                    )}
                  </h3>
                  <h4 
                    style={{ 
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.1rem", 
                      fontWeight: 600, 
                      color: "#ffffff",
                      marginBottom: "8px"
                    }}
                  >
                    {stat.label}
                  </h4>
                  <p 
                    style={{ 
                      color: "var(--text-muted)", 
                      fontSize: "0.85rem", 
                      lineHeight: 1.4, 
                      margin: 0,
                      maxWidth: "220px",
                      marginLeft: "auto",
                      marginRight: "auto"
                    }}
                  >
                    {stat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
