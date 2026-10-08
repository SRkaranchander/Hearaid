import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ParticleText from './ParticleText';
import ClickSpark from './animations/ClickSpark';

const BackgroundParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 14000), 80);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        color: i % 3 === 0 ? '#B895FF' : i % 3 === 1 ? '#D8C8FF' : '#ffffff',
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw constellation connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(184, 149, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#B895FF';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default function IntroScreen({ onComplete }) {
  const handleExplore = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ 
        opacity: 0, 
        filter: 'blur(15px)',
        transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at center, #16122b 0%, #0B0914 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden'
      }}
    >
      {/* Soft radial glow behind the text */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(184, 149, 255, 0.15) 0%, rgba(142, 103, 255, 0.05) 50%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Decorative Rotating AI Scanner Rings */}
      <div style={{ position: 'absolute', zIndex: 1, width: '480px', height: '480px', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px dashed rgba(184, 149, 255, 0.08)',
            boxShadow: '0 0 40px rgba(184, 149, 255, 0.02)'
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: '1px dashed rgba(216, 200, 255, 0.05)'
          }}
        />
        <motion.div
          animate={{ rotate: 180 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            border: '1px solid rgba(184, 149, 255, 0.03)',
            background: 'radial-gradient(circle, rgba(184, 149, 255, 0.04) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Floating particles background */}
      <BackgroundParticles />

      {/* ParticleText Wrapper */}
      <motion.div
        initial={{ scale: 1 }}
        exit={{ 
          scale: 0.88, 
          opacity: 0,
          transition: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }
        }}
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          position: 'relative'
        }}
      >
        <ParticleText
          text="HearAid"
          particleSize={2.2}
          density={4}
          color="#ffffff"
          highlightColor="#B895FF"
          scatter={180}
          gatherDuration={1600}
          stagger={420}
          pointerRepel={40}
          repelRadius={120}
          idleDrift={0.7}
          trigger="hover"
          fontSize="clamp(3.5rem, 12vw, 8.5rem)"
          fontWeight={800}
          fontFamily="inherit"
          glow
        />
      </motion.div>

      {/* Subtitle with fade-in animation */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
        style={{
          marginTop: '25px',
          color: '#BEB9D6',
          fontSize: '0.85rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '5px',
          textAlign: 'center',
          zIndex: 2,
          padding: '0 20px',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}
      >
        Breaking Communication Barriers Through AI
      </motion.p>

      {/* Accent Glass Divider */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '80px', opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.0, ease: 'easeOut' }}
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #B895FF, transparent)',
          marginTop: '20px',
          zIndex: 2
        }}
      />

      {/* Interactive Explore Button */}
      <ClickSpark style={{ marginTop: '45px', zIndex: 3 }}>
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8, ease: 'easeOut' }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.3 } }}
          onClick={handleExplore}
          style={{
            background: 'linear-gradient(135deg, rgba(184, 149, 255, 0.15) 0%, rgba(158, 123, 255, 0.05) 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(184, 149, 255, 0.3)',
            borderRadius: '30px',
            padding: '16px 48px',
            fontSize: '1.05rem',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            letterSpacing: '2px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 15px rgba(184, 149, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            position: 'relative',
            outline: 'none',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}
          whileHover={{ 
            scale: 1.05,
            border: '1px solid rgba(184, 149, 255, 0.8)',
            background: 'linear-gradient(135deg, #B895FF 0%, #8E67FF 100%)',
            boxShadow: '0 0 30px rgba(184, 149, 255, 0.45)',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Explore HearAid
        </motion.button>
      </ClickSpark>
    </motion.div>
  );
}
