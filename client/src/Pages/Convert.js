import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ClickSpark from '../Components/animations/ClickSpark';
import * as words from '../Animations/words';
import * as alphabets from '../Animations/alphabets';
import { defaultPose } from '../Animations/defaultPose';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import xbot from '../Models/xbot/xbot.glb';
import ybot from '../Models/ybot/ybot.glb';
import xbotPic from '../Models/xbot/xbot.png';
import ybotPic from '../Models/ybot/ybot.png';

export default function Convert() {
  const [text, setText] = useState('');
  const [inputText, setInputText] = useState('');
  const [bot, setBot] = useState(ybot);
  const [speed, setSpeed] = useState(0.1);
  const [pause, setPause] = useState(800);
  const [micError, setMicError] = useState('');
  const componentRef = useRef({});
  const { current: ref } = componentRef;
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const autoSignTimeout = useRef(null);
  const lastTranscript = useRef('');
  const runSignRef = useRef(null);

  useEffect(() => { ref.speed = speed; ref.pause = pause; }, [speed, pause, ref]);

  // Speech: auto-animate after 1.5s pause in speaking
  useEffect(() => {
    if (!transcript || transcript === lastTranscript.current) return;
    if (autoSignTimeout.current) clearTimeout(autoSignTimeout.current);
    autoSignTimeout.current = setTimeout(() => {
      lastTranscript.current = transcript;
      runSignRef.current(transcript);
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  // Setup THREE.js scene
  useEffect(() => {
    ref.flag = false; ref.pending = false;
    ref.animations = []; ref.characters = [];
    ref.scene = new THREE.Scene(); ref.scene.background = null;
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 5, 5);
    ref.scene.add(spotLight);
    ref.scene.add(new THREE.AmbientLight(0x00e5ff, 0.3));
    ref.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const el = document.getElementById('canvas-convert');
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
      const el2 = document.getElementById('canvas-convert');
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
        // Check if this is a text-display frame
        if (ref.animations[0][0] === 'add-text') {
          setText(t => t + ref.animations[0][1]);
          ref.animations.shift();
        } else {
          for (let i = 0; i < ref.animations[0].length;) {
            const [bn, ac, ax, lim, sg] = ref.animations[0][i];
            const obj = ref.avatar.getObjectByName(bn);
            if (!obj) { ref.animations[0].splice(i, 1); continue; }
            if (sg === '+' && obj[ac][ax] < lim) { obj[ac][ax] = Math.min(obj[ac][ax] + ref.speed, lim); i++; }
            else if (sg === '-' && obj[ac][ax] > lim) { obj[ac][ax] = Math.max(obj[ac][ax] - ref.speed, lim); i++; }
            else ref.animations[0].splice(i, 1);
          }
        }
      }
    } else {
      ref.flag = true; setTimeout(() => { ref.flag = false; }, ref.pause); ref.animations.shift();
    }
    ref.renderer.render(ref.scene, ref.camera);
  };

  runSignRef.current = (str) => {
    if (!str || !str.trim()) return;
    if (!ref.avatar) return;

    const upper = str.trim().toUpperCase();
    ref.animations = [];
    ref.flag = false;
    ref.pending = true;
    setText(''); // Clear text; it will build up as each sign plays

    upper.split(' ').forEach((word, wi, arr) => {
      if (!word) return;
      const isLastWord = wi === arr.length - 1;
      if (words[word]) {
        // Push bone frames first, then add-text so text appears when sign finishes
        words[word](ref);
        ref.animations.push(['add-text', isLastWord ? word : word + ' ']);
      } else {
        word.split('').forEach((ch, idx) => {
          const dm = { '0': 'ZERO', '1': 'ONE', '2': 'TWO', '3': 'THREE_NUM', '4': 'FOUR', '5': 'FIVE', '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE' };
          const key = dm[ch] || ch;
          const isLastChar = idx === word.length - 1;
          if (alphabets[key]) alphabets[key](ref);
          // Show the character after its sign animation frames
          ref.animations.push(['add-text', isLastChar && !isLastWord ? ch + ' ' : ch]);
        });
      }
    });

    ref.animate();
  };

  const startMic = async () => {
    setMicError('');
    // Check/request microphone permission explicitly
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setMicError('Microphone access denied. Please allow mic access in your browser settings.');
      return;
    }
    SpeechRecognition.abortListening();
    setTimeout(() => {
      resetTranscript();
      lastTranscript.current = '';
      SpeechRecognition.startListening({ continuous: true, language: 'en-US', interimResults: true });
    }, 300);
  };

  const stopMic = () => {
    SpeechRecognition.abortListening();
    if (autoSignTimeout.current) clearTimeout(autoSignTimeout.current);
  };

  return (
    <div className="main-content" style={{ padding: '100px 20px 40px' }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)', borderRadius: '16px', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(168,85,247,0.15))', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
              <span className="glow-text">Convert to ASL</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Text & speech → 3D sign language animations</p>
          </div>
        </div>
      </motion.div>

      <div className="row g-4">
        {/* Left controls */}
        <div className="col-md-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Processed text */}
                <div>
                  <label className="field-label"><i className="fa-solid fa-text-width" style={{ marginRight: '6px', color: 'var(--accent-cyan)' }} />Processed Text</label>
                  <textarea rows={3} value={text} readOnly className="form-control" style={{ resize: 'none' }} placeholder="Signed text appears here..." />
                </div>

                {/* Speech */}
                <div>
                  <label className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span><i className="fa-solid fa-microphone" style={{ marginRight: '6px', color: listening ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />Speech Input</span>
                    <span style={{ fontSize: '0.72rem', color: listening ? '#22c55e' : 'var(--text-muted)', fontWeight: 600 }}>
                      {listening ? '● LIVE' : '○ OFF'}
                    </span>
                  </label>

                  {!browserSupportsSpeechRecognition && (
                    <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '8px' }}>⚠ Use Chrome for speech recognition.</p>
                  )}
                  {micError && (
                    <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '8px' }}>⚠ {micError}</p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <ClickSpark style={{ flex: 1, display: 'flex' }}>
                      <button onClick={startMic}
                        style={{
                          width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(0,229,255,0.3)',
                          background: listening ? 'rgba(0,229,255,0.12)' : 'var(--glass-bg)',
                          color: 'var(--accent-cyan)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.25s',
                        }}>
                        <i className="fa-solid fa-microphone" /> On
                      </button>
                    </ClickSpark>
                    <ClickSpark style={{ flex: 1, display: 'flex' }}>
                      <button onClick={stopMic}
                        style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'var(--glass-bg)', color: '#f87171', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem' }}>
                        <i className="fa-solid fa-microphone-slash" /> Off
                      </button>
                    </ClickSpark>
                    <ClickSpark style={{ flex: 1, display: 'flex' }}>
                      <button onClick={() => { resetTranscript(); lastTranscript.current = ''; }}
                        style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid var(--border-glow)', background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem' }}>
                        Clear
                      </button>
                    </ClickSpark>
                  </div>

                  <textarea rows={3} value={transcript} readOnly className="form-control" style={{ resize: 'none' }} placeholder="Speak something..." />

                  <ClickSpark style={{ display: 'block', width: '100%', marginTop: '10px' }}>
                    <button onClick={() => runSignRef.current(transcript)} className="btn-neon" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                      <i className="fa-solid fa-play" /><span> Animate Speech</span>
                    </button>
                  </ClickSpark>
                </div>

                {/* Text input */}
                <div>
                  <label className="field-label"><i className="fa-solid fa-keyboard" style={{ marginRight: '6px', color: 'var(--accent-violet)' }} />Text Input</label>
                  <textarea rows={3} value={inputText} onChange={e => setInputText(e.target.value)} className="form-control" style={{ resize: 'none' }} placeholder="Type text to sign..." />
                  <ClickSpark style={{ display: 'block', width: '100%', marginTop: '10px' }}>
                    <button onClick={() => runSignRef.current(inputText)} className="btn-neon" style={{ width: '100%', justifyContent: 'center', padding: '11px', background: 'linear-gradient(135deg, #B895FF, #9E7BFF)' }}>
                      <i className="fa-solid fa-play" /><span> Animate Text</span>
                    </button>
                  </ClickSpark>
                </div>

              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle: 3D viewport */}
        <div className="col-md-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
            <div className="avatar-viewport" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: listening ? '#f87171' : '#22c55e', boxShadow: `0 0 6px ${listening ? '#f87171' : '#22c55e'}`, display: 'inline-block' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>{listening ? 'MIC LIVE' : '3D AVATAR LIVE'}</span>
              </div>
              <div id="canvas-convert" style={{ width: '100%', minHeight: 'calc(100vh - 250px)' }} />
            </div>
          </motion.div>
        </div>

        {/* Right: avatar controls */}
        <div className="col-md-3">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                    <i className="fa-solid fa-person" style={{ marginRight: '6px', color: 'var(--accent-cyan)' }} />Avatar
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[{ src: xbotPic, model: xbot, name: 'XBOT', desc: 'Futuristic' }, { src: ybotPic, model: ybot, name: 'YBOT', desc: 'Classic' }].map(av => (
                      <div key={av.name} style={{
                        background: bot === av.model ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-surface)',
                        border: bot === av.model ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                        borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.3s'
                      }} onClick={() => setBot(av.model)}>
                        <img src={av.src} alt={av.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{av.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{av.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                    <span><i className="fa-solid fa-gauge" style={{ marginRight: '6px', color: 'var(--accent-cyan)' }} />Speed</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{Math.round(speed * 100) / 100}</span>
                  </label>
                  <input type="range" className="form-range" min="0.05" max="0.5" step="0.01" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
                </div>

                <div>
                  <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
                    <span><i className="fa-solid fa-clock" style={{ marginRight: '6px', color: '#ec4899' }} />Pause</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{pause}ms</span>
                  </label>
                  <input type="range" className="form-range pink-thumb" min="0" max="2000" step="10" value={pause} onChange={e => setPause(parseInt(e.target.value))} />
                </div>

                <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                    <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent-cyan)', marginRight: '8px' }} />
                    Type text or use speech to see a real-time 3D sign language demonstration.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
