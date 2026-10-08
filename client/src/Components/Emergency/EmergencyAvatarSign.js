import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ybot from '../../Models/ybot/ybot.glb';
import * as words from '../../Animations/words';
import * as alphabets from '../../Animations/alphabets';
import { defaultPose } from '../../Animations/defaultPose';

export default function EmergencyAvatarSign({ phrase }) {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLetter, setCurrentLetter] = useState('');
  const [speed, setSpeed] = useState(0.12);
  const componentRef = useRef({});
  const { current: ref } = componentRef;

  useEffect(() => {
    ref.speed = speed;
    ref.pause = 600;
  }, [speed, ref]);

  useEffect(() => {
    ref.flag = false;
    ref.pending = false;
    ref.animations = [];
    ref.characters = [];
    ref.scene = new THREE.Scene();
    ref.scene.background = null;

    const spotLight = new THREE.SpotLight(0xffffff, 2.2);
    spotLight.position.set(0, 5, 5);
    ref.scene.add(spotLight);

    const ambLight = new THREE.AmbientLight(0x0284c7, 0.35);
    ref.scene.add(ambLight);

    ref.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    const el = containerRef.current;
    if (!el) return;

    const width = el.clientWidth || 340;
    const height = el.clientHeight || 300;

    ref.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    ref.renderer.setSize(width, height);
    ref.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    el.innerHTML = '';
    el.appendChild(ref.renderer.domElement);

    ref.camera.position.z = 1.65;
    ref.camera.position.y = 1.35;

    let isMounted = true;

    new GLTFLoader().load(ybot, (gltf) => {
      if (!isMounted) return;
      gltf.scene.traverse((c) => {
        if (c.type === 'SkinnedMesh') c.frustumCulled = false;
      });
      ref.avatar = gltf.scene;
      ref.scene.add(ref.avatar);
      defaultPose(ref);
      ref.renderer.render(ref.scene, ref.camera);

      // Auto-trigger sign demonstration once loaded
      if (phrase) {
        setTimeout(() => {
          playEmergencyPhrase(phrase);
        }, 400);
      }
    });

    const onResize = () => {
      if (!containerRef.current || !ref.camera || !ref.renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      ref.camera.aspect = w / h;
      ref.camera.updateProjectionMatrix();
      ref.renderer.setSize(w, h);
      if (ref.scene && ref.avatar) {
        ref.renderer.render(ref.scene, ref.camera);
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', onResize);
      if (el) el.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  ref.animate = () => {
    if (!ref.animations || !ref.animations.length) {
      ref.pending = false;
      setIsPlaying(false);
      return;
    }

    requestAnimationFrame(ref.animate);

    if (ref.animations[0].length) {
      if (!ref.flag) {
        if (ref.animations[0][0] === 'add-text') {
          setCurrentLetter(ref.animations[0][1]);
          ref.animations.shift();
        } else {
          for (let i = 0; i < ref.animations[0].length;) {
            const [bn, ac, ax, lim, sg] = ref.animations[0][i];
            const obj = ref.avatar ? ref.avatar.getObjectByName(bn) : null;
            if (!obj) {
              ref.animations[0].splice(i, 1);
              continue;
            }
            if (sg === '+' && obj[ac][ax] < lim) {
              obj[ac][ax] = Math.min(obj[ac][ax] + ref.speed, lim);
              i++;
            } else if (sg === '-' && obj[ac][ax] > lim) {
              obj[ac][ax] = Math.max(obj[ac][ax] - ref.speed, lim);
              i++;
            } else {
              ref.animations[0].splice(i, 1);
            }
          }
        }
      }
    } else {
      ref.flag = true;
      setTimeout(() => {
        ref.flag = false;
      }, ref.pause || 500);
      ref.animations.shift();
    }

    if (ref.renderer && ref.scene && ref.camera) {
      ref.renderer.render(ref.scene, ref.camera);
    }
  };

  const playEmergencyPhrase = (str) => {
    if (!str || !ref.avatar) return;
    setIsPlaying(true);
    setCurrentLetter('');
    ref.animations = [];
    ref.flag = false;
    ref.pending = true;

    const wordsArr = str.trim().toUpperCase().split(/\s+/);

    wordsArr.forEach((word) => {
      if (!word) return;

      if (words[word]) {
        // Whole-word sign animation
        words[word](ref);
        ref.animations.push(['add-text', word]);
      } else {
        // Fingerspell each letter
        const chars = word.split('');
        chars.forEach((ch) => {
          const dm = {
            '0': 'ZERO', '1': 'ONE', '2': 'TWO', '3': 'THREE_NUM',
            '4': 'FOUR', '5': 'FIVE', '6': 'SIX', '7': 'SEVEN',
            '8': 'EIGHT', '9': 'NINE'
          };
          const key = dm[ch] || ch;
          if (alphabets[key]) {
            alphabets[key](ref);
          }
          ref.animations.push(['add-text', ch]);
        });
      }
    });

    ref.animate();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--bg-surface-hover)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        border: '1px solid var(--border-light)',
        width: '100%',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: '10px'
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: '600',
            fontSize: '0.9rem',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🤖</span> 3D ASL Sign Demonstration
        </span>
        {currentLetter && (
          <span
            style={{
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700'
            }}
          >
            {currentLetter}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '240px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginTop: '12px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => playEmergencyPhrase(phrase)}
          disabled={isPlaying}
          style={{
            background: isPlaying ? 'var(--bg-surface)' : 'var(--gradient-primary)',
            color: '#ffffff',
            border: 'none',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isPlaying ? 'Signing...' : '▶ Replay Sign'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '0.75rem'
            }}
          >
            <option value="0.06">0.5x Slow</option>
            <option value="0.12">1.0x Normal</option>
            <option value="0.18">1.5x Fast</option>
          </select>
        </div>
      </div>
    </div>
  );
}
