import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { communityURL } from '../Config/config';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cu = JSON.parse(localStorage.getItem('currentUser'));
    if (!cu) { navigate('/hearaid/login'); return; }
    fetchUser(cu._id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUser = async (id) => {
    try {
      const res = await axios.get(`${communityURL}/users`);
      const u = res.data.find(u => u._id === id);
      setUser(u);
      setFormData({ name: u.name, email: u.email, bio: u.bio || '' });
    } catch { }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${communityURL}/users/${user._id}`, formData);
      const updated = { ...user, ...formData };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      window.dispatchEvent(new Event('userLogin'));
      setIsEditing(false);
    } catch { }
    setSaving(false);
  };

  if (!user) return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block', color: 'var(--accent-cyan)' }} />
        <span style={{ fontFamily: "'Outfit', sans-serif" }}>Loading Profile...</span>
      </div>
    </div>
  );

  return (
    <div className="main-content" style={{ padding: '100px 20px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'var(--accent-purple)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Banner */}
            <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--bg-surface-hover), var(--bg-main))', position: 'relative', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--gradient-primary)', opacity: 0.2 }}></div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 40px 40px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '-60px', marginBottom: '24px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '4px solid var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-cyan)', boxShadow: '0 8px 32px var(--border-light)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: user.status === 'online' ? '#10b981' : 'var(--text-muted)', border: '4px solid var(--bg-secondary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <h2 className="heading-lg mb-1" style={{ fontSize: '2.5rem' }}>
                    <span className="text-gradient">{user.name}</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>{user.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn-premium">
                      <i className="fa-solid fa-pen me-2" />Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSave} disabled={saving} className="btn-premium" style={{ opacity: saving ? 0.7 : 1 }}>
                        {saving ? <><i className="fa-solid fa-circle-notch fa-spin me-2" />Saving</> : <><i className="fa-solid fa-check me-2" />Save</>}
                      </button>
                      <button onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, bio: user.bio || '' }); }} className="btn-premium-outline">
                        Cancel
                      </button>
                    </>
                  )}
                  <button onClick={() => navigate('/hearaid/community')} className="btn-premium-outline">
                    <i className="fa-solid fa-users me-2" /> Community
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="row g-4 mb-4">
                {[
                  { icon: 'fa-user-group', label: 'Friends', value: user.friends?.length || 0, color: 'var(--accent-cyan)' },
                  { icon: 'fa-bell', label: 'Requests', value: user.receivedRequests?.length || 0, color: 'var(--accent-purple)' },
                  { icon: 'fa-calendar', label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }), color: 'var(--accent-blue)' },
                ].map((s, i) => (
                  <div key={i} className="col-md-4">
                    <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', textAlign: 'center', transition: 'transform 0.3s' }}>
                      <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '1.5rem', marginBottom: '12px' }} />
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{s.value}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '30px' }}>
                      {[
                        { label: 'Full Name', value: user.name, icon: 'fa-user' },
                        { label: 'Email Address', value: user.email, icon: 'fa-envelope' },
                        { label: 'Bio', value: user.bio || 'No bio added yet', icon: 'fa-quote-left' },
                      ].map((d, i) => (
                        <div key={i} style={{ marginBottom: i !== 2 ? '24px' : '0' }}>
                          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            <i className={`fa-solid ${d.icon}`} style={{ marginRight: '8px', color: 'var(--accent-cyan)' }} />{d.label}
                          </label>
                          <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {[{ label: 'Full Name', name: 'name', type: 'text', icon: 'fa-user' }, { label: 'Email Address', name: 'email', type: 'email', icon: 'fa-envelope' }].map(f => (
                        <div key={f.name}>
                          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            <i className={`fa-solid ${f.icon}`} style={{ marginRight: '8px', color: 'var(--accent-cyan)' }} />{f.label}
                          </label>
                          <input type={f.type} className="form-control" value={formData[f.name]} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} />
                        </div>
                      ))}
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                          <i className="fa-solid fa-quote-left" style={{ marginRight: '8px', color: 'var(--accent-cyan)' }} />Bio
                        </label>
                        <textarea className="form-control" rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
