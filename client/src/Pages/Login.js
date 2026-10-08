import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { communityURL } from '../Config/config';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoSymbol from '../Assets/logo_symbol.png';
import ClickSpark from '../Components/animations/ClickSpark';


export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('currentUser')) navigate('/hearaid/home');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.get(`${communityURL}/users`);
        const user = res.data.find(u => u.email === formData.email);
        if (user) {
          await axios.patch(`${communityURL}/users/${user._id}/status`, { status: 'online' });
          localStorage.setItem('currentUser', JSON.stringify(user));
          window.dispatchEvent(new Event('userLogin'));
          navigate('/hearaid/convert');
        } else {
          setError('No account found with this email. Please sign up.');
        }
      } else {
        const res = await axios.post(`${communityURL}/users`, {
          name: formData.name, email: formData.email,
          bio: formData.bio || 'ASL learner',
        });
        localStorage.setItem('currentUser', JSON.stringify(res.data));
        window.dispatchEvent(new Event('userLogin'));
        navigate('/hearaid/convert');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', paddingTop: '100px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: '1100px', background: 'var(--bg-surface)',
          borderRadius: '32px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', overflow: 'hidden',
          border: '1px solid var(--border-light)', minHeight: '600px', maxHeight: 'calc(100vh - 120px)', display: 'flex'
        }}
      >
        <div className="row g-0 m-0 w-100" style={{ flex: 1 }}>

          {/* Left Panel (Colored Decorative Section) */}
          <div className="col-md-5 col-lg-5 d-none d-md-flex flex-column align-items-center justify-content-center position-relative" style={{ background: 'var(--gradient-primary)', padding: '30px', color: '#fff', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>

            <motion.div key={isLogin ? 'logo-login' : 'logo-signup'} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
              <div className="logo-box" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden', background: 'transparent' }}>
                <img src={logoSymbol} alt="HearAid" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '2px', fontSize: '1.6rem', marginBottom: '35px' }}>HEARAID</h3>
            </motion.div>

            <motion.div key={isLogin ? 'text-login' : 'text-signup'} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '2.5rem', marginBottom: '15px' }}>
                {isLogin ? 'Hello, Friend!' : 'Welcome Back!'}
              </h2>
              <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.5, marginBottom: '35px', maxWidth: '320px', margin: '0 auto 35px' }}>
                {isLogin ? 'Enter your personal details and start your learning journey with us.' : 'To keep connected with us please login with your personal info.'}
              </p>

              <ClickSpark>
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  style={{
                    background: 'transparent', border: '2px solid rgba(255,255,255,0.8)', color: '#fff',
                    borderRadius: '40px', padding: '12px 45px', fontWeight: 600, letterSpacing: '1px', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {isLogin ? 'SIGN UP' : 'SIGN IN'}
                </button>
              </ClickSpark>
            </motion.div>
          </div>

          {/* Right Panel (Form Section) */}
          <div className="col-md-7 col-lg-7 d-flex flex-column justify-content-center align-items-center position-relative" style={{ background: 'var(--bg-surface)', padding: '40px 20px', overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: '420px', margin: 'auto' }}>
              <motion.div key={isLogin ? 'header-login' : 'header-signup'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: 'var(--accent-cyan)', textAlign: 'center', fontSize: '2.5rem', marginBottom: '5px' }}>
                  {isLogin ? 'Welcome' : 'Create Account'}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1rem' }}>
                  {isLogin ? 'Login to your account to continue' : 'Sign up to connect and learn'}
                </p>
              </motion.div>

              {error && (
                <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa fa-exclamation-circle"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <input
                        type="text" placeholder="Full Name" required
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '14px 22px', borderRadius: '40px', border: '1px solid var(--border-light)', background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }}
                        onFocus={(e) => { e.target.style.border = '1px solid var(--accent-cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(6,182,212,0.1)'; }}
                        onBlur={(e) => { e.target.style.border = '1px solid var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="email" placeholder="Email Address" required
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '14px 22px', borderRadius: '30px', border: '1px solid var(--border-light)', background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }}
                  onFocus={(e) => { e.target.style.border = '1px solid var(--accent-cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(6,182,212,0.1)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                />

                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div key="bio" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <input
                        type="text" placeholder="Bio (Optional)"
                        value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        style={{ width: '100%', padding: '14px 22px', borderRadius: '30px', border: '1px solid var(--border-light)', background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }}
                        onFocus={(e) => { e.target.style.border = '1px solid var(--accent-cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(6,182,212,0.1)'; }}
                        onBlur={(e) => { e.target.style.border = '1px solid var(--border-light)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLogin && <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>Forgot your password?</div>}

                <ClickSpark style={{ display: 'block', width: '100%' }}>
                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '15px', borderRadius: '30px', border: 'none', background: 'var(--accent-cyan)', color: '#fff', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '1px', marginTop: '10px', boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)', transition: 'all 0.3s'
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(6, 182, 212, 0.4)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 182, 212, 0.3)'; }}
                  >
                    {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
                  </button>
                </ClickSpark>

                <div className="d-block d-md-none text-center mt-3" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <ClickSpark style={{ display: 'inline-block' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                      {isLogin ? 'Sign up' : 'Log in'}
                    </span>
                  </ClickSpark>
                </div>
              </form>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
