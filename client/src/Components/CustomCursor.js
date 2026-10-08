import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const CenterDot = ({ x, y }) => (
  <div
    style={{
      position: 'fixed',
      top: y - 3,
      left: x - 3,
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 10px 2px rgba(6, 182, 212, 0.8)',
      pointerEvents: 'none',
      zIndex: 10000,
    }}
  />
);

const TorchCursor = ({ x, y }) => (
  <>
    <div
      style={{
        position: 'fixed', top: y - 300, left: x - 300, width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.05) 40%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none', zIndex: 9998, mixBlendMode: 'screen',
      }}
    />
    <CenterDot x={x} y={y} />
  </>
);

const RippleCursor = ({ x, y }) => (
  <>
    <motion.div
      animate={{ scale: [1, 2], opacity: [0.8, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
      style={{ position: 'fixed', top: y - 20, left: x - 20, width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #B895FF', pointerEvents: 'none', zIndex: 9997 }}
    />
    <motion.div
      animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
      style={{ position: 'fixed', top: y - 15, left: x - 15, width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #B895FF', pointerEvents: 'none', zIndex: 9998 }}
    />
    <CenterDot x={x} y={y} />
  </>
);

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const location = useLocation();

  useEffect(() => {
    const mouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mouseMove);
    document.body.classList.add('hide-default-cursor');

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      document.body.classList.remove('hide-default-cursor');
    };
  }, []);

  const path = location.pathname;
  const { x, y } = mousePosition;

  // Use Torch effect ONLY on the Home page
  if (path === '/hearaid/home' || path === '/' || path === '') {
    return <TorchCursor x={x} y={y} />;
  }

  // Use the Ripple (Community) effect on all other pages
  return <RippleCursor x={x} y={y} />;
};

export default CustomCursor;
