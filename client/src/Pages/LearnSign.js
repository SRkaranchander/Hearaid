import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ClickSpark from '../Components/animations/ClickSpark';
import * as words from '../Animations/words';
import * as alphabets from '../Animations/alphabets';
import { defaultPose } from '../Animations/defaultPose';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import xbot from '../Models/xbot/xbot.glb';
import ybot from '../Models/ybot/ybot.glb';
import xbotPic from '../Models/xbot/xbot.png';
import ybotPic from '../Models/ybot/ybot.png';

const DIGIT_MAP = { '0': 'ZERO', '1': 'ONE', '2': 'TWO', '3': 'THREE_NUM', '4': 'FOUR', '5': 'FIVE', '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE' };

export default function LearnSign() {
  const [bot, setBot] = useState(ybot);
  const [speed, setSpeed] = useState(0.1);
  const [pause, setPause] = useState(800);
  const [activeSection, setActiveSection] = useState('alpha');
  const componentRef = useRef({});
  const { current: ref } = componentRef;

  useEffect(() => {
    ref.speed = speed;
    ref.pause = pause;
  }, [speed, pause, ref]);

  useEffect(() => {
    ref.flag = false; ref.pending = false;
    ref.animations = []; ref.characters = [];
    ref.scene = new THREE.Scene(); ref.scene.background = null;
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 5, 5); ref.scene.add(spotLight);
    const ambLight = new THREE.AmbientLight(0xa855f7, 0.2); ref.scene.add(ambLight);
    ref.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const el = document.getElementById('canvas-learn');
    const w = el?.clientWidth || window.innerWidth * 0.55;
    const h = Math.max(window.innerHeight - 120, 500);
    ref.camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 1000);
    ref.renderer.setSize(w, h);
    ref.renderer.setPixelRatio(window.devicePixelRatio);
    if (el) { el.innerHTML = ''; el.appendChild(ref.renderer.domElement); }
    ref.camera.position.z = 1.6; ref.camera.position.y = 1.4;
    new GLTFLoader().load(bot, (gltf) => {
      gltf.scene.traverse(c => { if (c.type === 'SkinnedMesh') c.frustumCulled = false; });
      ref.avatar = gltf.scene; ref.scene.add(ref.avatar); defaultPose(ref);
    });
    const onResize = () => {
      const el2 = document.getElementById('canvas-learn');
      if (!el2 || !ref.camera || !ref.renderer) return;
      const w2 = el2.clientWidth; const h2 = Math.max(window.innerHeight - 120, 500);
      ref.camera.aspect = w2 / h2; ref.camera.updateProjectionMatrix(); ref.renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ref, bot]);

  ref.animate = () => {
    if (!ref.animations.length) { ref.pending = false; return; }
    requestAnimationFrame(ref.animate);
    if (ref.animations[0].length) {
      if (!ref.flag) {
        for (let i = 0; i < ref.animations[0].length;) {
          const [bn, ac, ax, lim, sg] = ref.animations[0][i];
          const obj = ref.avatar.getObjectByName(bn);
          if (sg === '+' && obj[ac][ax] < lim) { obj[ac][ax] = Math.min(obj[ac][ax] + ref.speed, lim); i++; }
          else if (sg === '-' && obj[ac][ax] > lim) { obj[ac][ax] = Math.max(obj[ac][ax] - ref.speed, lim); i++; }
          else ref.animations[0].splice(i, 1);
        }
      }
    } else {
      ref.flag = true; setTimeout(() => { ref.flag = false; }, ref.pause); ref.animations.shift();
    }
    ref.renderer.render(ref.scene, ref.camera);
  };

  const playSign = (fn) => {
    if (ref.animations.length === 0) {
      fn(ref);
      if (!ref.pending) { ref.pending = true; ref.animate(); }
    }
  };

  const PillGrid = ({ items, onClick, cols = 4 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
      {items.map(({ label, fn }) => (
        <ClickSpark key={label} style={{ display: 'flex', width: '100%' }}>
          <button onClick={() => playSign(fn)} style={{
            background: 'var(--bg-surface-hover)', border: '1px solid var(--bg-surface-hover)',
            borderRadius: '10px', padding: '10px', color: 'var(--text-primary)',
            fontFamily: "'Syne', sans-serif", fontWeight: '600', fontSize: '1rem',
            cursor: 'pointer', transition: 'all 0.2s transform 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'
          }} onMouseOver={e => { e.currentTarget.style.background = 'var(--gradient-primary)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--accent-glow)'; }} onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            {label}
          </button>
        </ClickSpark>
      ))}
    </div>
  );

  const alphaItems = Array.from({ length: 26 }, (_, i) => {
    const ch = String.fromCharCode(i + 65);
    return { label: ch, fn: (r) => alphabets[ch](r) };
  });
  const wordItems = words.wordList.map(w => ({ label: w, fn: (r) => words[w](r) }));
  const digitItems = Object.keys(DIGIT_MAP).map(d => ({ label: d, fn: (r) => alphabets[DIGIT_MAP[d]](r) }));

  const sections = [
    { id: 'alpha', label: 'A–Z', icon: 'fa-font', items: alphaItems, cols: 4 },
    { id: 'words', label: 'Words', icon: 'fa-comment', items: wordItems, cols: 3 },
    { id: 'digits', label: '0–9', icon: 'fa-hashtag', items: digitItems, cols: 4 },
  ];

  return (
    <div className="main-content" style={{ padding: '100px 20px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: '20%', width: '500px', height: '500px', background: 'var(--accent-purple)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
              <i className="fa-solid fa-graduation-cap text-primary fs-4" />
            </div>
            <div>
              <h2 className="heading-lg mb-1" style={{ fontSize: '1.8rem' }}>
                <span className="text-gradient">Learn Sign Language</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Click any sign to watch the 3D avatar demonstrate it interactively</p>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          <div className="col-lg-3 order-2 order-lg-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', background: 'var(--border-light)', padding: '5px', borderRadius: '12px', marginBottom: '24px' }}>
                  {sections.map(s => (
                    <ClickSpark key={s.id} style={{ flex: 1, display: 'flex' }}>
                      <button onClick={() => setActiveSection(s.id)} style={{
                        width: '100%', padding: '10px 2px', borderRadius: '8px', border: 'none', background: activeSection === s.id ? 'var(--bg-surface)' : 'transparent',
                        color: activeSection === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'all 0.3s', fontWeight: '500', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                      }}>
                        <i className={`fa-solid ${s.icon}`} /> {s.label}
                      </button>
                    </ClickSpark>
                  ))}
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
                  {sections.map(s => s.id === activeSection && <PillGrid key={s.id} items={s.items} cols={s.cols} />)}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-lg-6 order-1 order-lg-2">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <div style={{ position: 'relative', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-light)', overflow: 'hidden', minHeight: 'calc(100vh - 250px)' }}>
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(184,149,255,0.1)', border: '1px solid rgba(184,149,255,0.2)', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B895FF', boxShadow: '0 0 8px #B895FF' }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#B895FF' }}>3D AVATAR LIVE</span>
                </div>
                <div id="canvas-learn" style={{ width: '100%', minHeight: 'calc(100vh - 250px)' }} />
              </div>
            </motion.div>
          </div>

          <div className="col-lg-3 order-3 order-lg-3">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                    <i className="fa-solid fa-person" style={{ marginRight: '6px', color: 'var(--accent-cyan)' }} />Avatar
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[{ src: xbotPic, model: xbot, name: 'XBOT', desc: 'Futuristic' }, { src: ybotPic, model: ybot, name: 'YBOT', desc: 'Classic' }].map(av => (
                      <ClickSpark key={av.name} style={{ display: 'block', width: '100%' }}>
                        <div style={{
                          background: bot === av.model ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-surface)',
                          border: bot === av.model ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                          borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.3s', width: '100%'
                        }} onClick={() => setBot(av.model)}>
                          <img src={av.src} alt={av.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{av.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{av.desc}</div>
                          </div>
                        </div>
                      </ClickSpark>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                    <span><i className="fa-solid fa-gauge" style={{ marginRight: '6px', color: 'var(--accent-cyan)' }} />Speed</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{Math.round(speed * 100) / 100}</span>
                  </label>
                  <input type="range" className="form-range" min="0.05" max="0.5" step="0.01" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                    <span><i className="fa-solid fa-clock" style={{ marginRight: '6px', color: '#ec4899' }} />Pause</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{pause}ms</span>
                  </label>
                  <input type="range" className="form-range pink-thumb" min="0" max="2000" step="10" value={pause} onChange={e => setPause(parseInt(e.target.value))} />
                </div>

                <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                    <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent-cyan)', marginRight: '8px' }} />
                    Select an item from the library to see a real-time 3D sign language demonstration.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
