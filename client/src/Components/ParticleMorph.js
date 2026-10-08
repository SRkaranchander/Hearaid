import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const ParticleMorph = ({ onComplete }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Particle setup
    const PARTICLE_COUNT = 3000;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Text generation function
    const getTextPositions = (text) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 600;
      canvas.height = 200;

      ctx.fillStyle = "white";
      ctx.font = "bold 80px Arial";
      ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, 130);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const points = [];
      
      for (let y = 0; y < canvas.height; y += 3) {
        for (let x = 0; x < canvas.width; x += 3) {
          const index = (y * canvas.width + x) * 4;
          if (data[index + 3] > 128) {
            points.push({
              x: x - canvas.width / 2,
              y: canvas.height / 2 - y,
              z: 0
            });
          }
        }
      }
      return points;
    };

    // Animation sequence
    const animateSequence = async () => {
      const textPoints = getTextPositions("HEAR AID");
      const posArray = geometry.attributes.position.array;

      // Morph to text
      const morphPromises = [];
      for (let i = 0; i < textPoints.length && i < PARTICLE_COUNT; i++) {
        morphPromises.push(
          gsap.to(posArray, {
            duration: 2,
            [i * 3]: textPoints[i].x,
            [i * 3 + 1]: textPoints[i].y,
            [i * 3 + 2]: textPoints[i].z,
            ease: "power2.inOut"
          })
        );
      }

      // Update geometry during animation
      const updateGeometry = () => {
        geometry.attributes.position.needsUpdate = true;
      };
      
      gsap.ticker.add(updateGeometry);
      
      await Promise.all(morphPromises);
      
      // Hold for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fade out
      await gsap.to(material, {
        duration: 1,
        opacity: 0,
        ease: "power2.inOut"
      });

      gsap.ticker.remove(updateGeometry);
      
      // Call completion callback
      if (onComplete) onComplete();
    };

    // Start animation
    animateSequence();

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    sceneRef.current = { scene, renderer, camera, particles };

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ParticleMorph;