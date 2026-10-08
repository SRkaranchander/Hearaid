import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { communityURL, socketURL } from '../Config/config';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const socket = io(socketURL, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

function UserCard({ user, onClick, onConnect, onCancel, isActive }) {
  return (
    <div className={`user-card-item ${isActive ? 'active' : ''}`} onClick={() => user.connectionStatus === 'friends' && onClick()} style={{ padding: '12px', display: 'flex', gap: '12px', cursor: user.connectionStatus === 'friends' ? 'pointer' : 'default', background: isActive ? 'var(--bg-surface-hover)' : 'transparent', borderRadius: '12px', transition: 'all 0.2s', border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent' }} onMouseOver={e => !isActive && (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseOut={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, boxShadow: 'var(--accent-glow)' }}>
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.status === 'online' ? '#10b981' : 'var(--text-muted)' }} />
        </div>
        {user.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.bio}</p>}
        <div onClick={e => e.stopPropagation()}>
          {user.connectionStatus === 'none' && (
            <button className="btn-premium-outline" onClick={onConnect} style={{ padding: '4px 10px', fontSize: '0.75rem' }}><i className="fa-solid fa-user-plus me-1" />Connect</button>
          )}
          {user.connectionStatus === 'waiting' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-premium-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--warning)', color: 'var(--warning)', pointerEvents: 'none' }}>Pending</button>
              <button className="btn-premium-outline" onClick={onCancel} style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Cancel</button>
            </div>
          )}
          {user.connectionStatus === 'received' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Wants to connect</span>
              <button className="btn-premium" onClick={onConnect} style={{ padding: '4px 10px', fontSize: '0.75rem' }}><i className="fa-solid fa-check me-1" />Accept</button>
            </div>
          )}
          {user.connectionStatus === 'friends' && (
            <button className="btn-premium-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981', pointerEvents: 'none' }}><i className="fa-solid fa-check me-1" />Friends</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBox({ currentUser, selectedUser, messages, onSendMessage }) {
  const [newMsg, setNewMsg] = useState('');
  const endRef = React.useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, selectedUser]);

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    await onSendMessage({ text: newMsg, senderId: currentUser._id, receiverId: selectedUser._id });
    setNewMsg('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-surface-hover)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
          {selectedUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedUser.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedUser.status === 'online' ? '#10b981' : 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: selectedUser.status === 'online' ? '#10b981' : 'var(--text-muted)' }}>
              {selectedUser.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-main)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
            <i className="fa-solid fa-comments" style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--border-light)' }} />
            <p>Start the conversation with {selectedUser.name}</p>
          </div>
        )}
        {messages.map(msg => (
          <motion.div key={msg._id} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: msg.senderId === currentUser._id ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '70%' }}>
              <div style={{
                background: msg.senderId === currentUser._id ? 'var(--gradient-primary)' : 'var(--bg-surface)',
                border: msg.senderId === currentUser._id ? 'none' : '1px solid var(--border-light)',
                padding: '12px 16px',
                borderRadius: msg.senderId === currentUser._id ? '16px 16px 0 16px' : '16px 16px 16px 0',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                boxShadow: msg.senderId === currentUser._id ? '0 4px 12px rgba(0, 229, 255, 0.2)' : 'none'
              }}>
                {msg.text}
              </div>
              <div style={{ textAlign: msg.senderId === currentUser._id ? 'right' : 'left', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px', background: 'var(--bg-surface-hover)' }}>
        <input type="text" className="form-control" placeholder="Type your message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1, borderRadius: '24px' }} />
        <button type="submit" className="btn-premium" style={{ borderRadius: '24px', padding: '10px 24px' }}>
          <i className="fa-solid fa-paper-plane me-2" />Send
        </button>
      </form>
    </div>
  );
}

export default function Community() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { navigate('/hearaid/login'); return; }
    setCurrentUser(user);
    fetchUsers();
    socket.emit('join', user._id);
    socket.on('reconnect', () => socket.emit('join', user._id));
    const handleMsg = (msg) => {
      if (msg.senderId === user._id) return;
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
    };
    socket.on('receiveMessage', handleMsg);
    return () => {
      socket.off('receiveMessage', handleMsg);
      socket.off('reconnect');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${communityURL}/users`);
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const all = res.data.filter(u => u._id !== user._id).map(u => ({
        ...u,
        connectionStatus: user.friends?.includes(u._id) ? 'friends'
          : user.sentRequests?.includes(u._id) ? 'waiting'
            : user.receivedRequests?.includes(u._id) ? 'received' : 'none',
      }));
      setUsers(all);
      setFriends(all.filter(u => u.connectionStatus === 'friends'));
    } catch { }
  };

  const handleUserClick = async (user) => {
    if (user.connectionStatus !== 'friends') return;
    setSelectedUser(user); setMessages([]);
    try {
      const res = await axios.get(`${communityURL}/messages/${currentUser._id}/${user._id}`);
      setMessages(res.data);
    } catch { }
  };

  const handleConnect = async (userId) => {
    try {
      await axios.post(`${communityURL}/users/${currentUser._id}/connect`, { targetUserId: userId });
      const res = await axios.get(`${communityURL}/users`);
      const updated = res.data.find(u => u._id === currentUser._id);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setCurrentUser(updated); fetchUsers();
    } catch { }
  };

  const handleCancel = async (userId) => {
    try {
      await axios.delete(`${communityURL}/users/${currentUser._id}/cancel/${userId}`);
      const res = await axios.get(`${communityURL}/users`);
      const updated = res.data.find(u => u._id === currentUser._id);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setCurrentUser(updated); fetchUsers();
    } catch { }
  };

  const handleSendMessage = async (msg) => {
    try {
      const res = await axios.post(`${communityURL}/messages`, msg);
      setMessages(prev => [...prev, res.data]);
      socket.emit('sendMessage', res.data);
    } catch { }
  };

  const handleLogout = async () => {
    try { await axios.patch(`${communityURL}/users/${currentUser._id}/status`, { status: 'offline' }); } catch { }
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userLogin'));
    navigate('/hearaid/home');
  };

  const listToShow = activeTab === 'friends' ? friends : users;
  const onlineCount = users.filter(u => u.status === 'online').length;

  return (
    <div className="main-content" style={{ padding: '100px 20px 40px', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: '10%', width: '500px', height: '500px', background: 'var(--accent-purple)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>

      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, maxWidth: '1400px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)' }}>
                <i className="fa-solid fa-users text-primary fs-4" />
              </div>
              <div>
                <h2 className="heading-lg mb-1" style={{ fontSize: '1.8rem' }}>
                  <span className="text-gradient">ASL Community</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Connect with friends and practice signing together</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '24px', padding: '8px 16px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#10b981' }}>{onlineCount} Online</span>
              </div>
              <button onClick={handleLogout} className="btn-premium-outline">
                <i className="fa-solid fa-right-from-bracket me-2" /> Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="row g-4" style={{ flex: 1, minHeight: 0 }}>
          {/* Sidebar */}
          <div className="col-lg-4" style={{ height: '100%' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ height: '100%' }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

                {/* Current user */}
                {currentUser && (
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-surface-hover)' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-surface)' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Online</div>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '12px', padding: '6px' }}>
                    <button onClick={() => setActiveTab('friends')} style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                      background: activeTab === 'friends' ? 'var(--bg-surface)' : 'transparent',
                      color: activeTab === 'friends' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: '600', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                      <i className="fa-solid fa-user-group" /> Friends
                      <span style={{ background: 'var(--gradient-primary)', color: 'var(--text-primary)', borderRadius: '12px', padding: '2px 8px', fontSize: '0.7rem' }}>{friends.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('all')} style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                      background: activeTab === 'all' ? 'var(--bg-surface)' : 'transparent',
                      color: activeTab === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: '600', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                      <i className="fa-solid fa-globe" /> Discover
                    </button>
                  </div>
                </div>

                {/* User list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {listToShow.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-users-slash" style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--border-light)' }} />
                      <p style={{ margin: 0 }}>{activeTab === 'friends' ? "No friends yet. Discover some below!" : "No users found."}</p>
                    </div>
                  ) : listToShow.map(user => (
                    <UserCard key={user._id} user={user} onClick={() => handleUserClick(user)}
                      onConnect={() => handleConnect(user._id)} onCancel={() => handleCancel(user._id)}
                      isActive={selectedUser?._id === user._id} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chat area */}
          <div className="col-lg-8" style={{ height: '100%' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ height: '100%' }}>
              <div className="glass-card" style={{ height: '100%', padding: 0, overflow: 'hidden' }}>
                {selectedUser ? (
                  <ChatBox currentUser={currentUser} selectedUser={selectedUser} messages={messages} onSendMessage={handleSendMessage} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '40px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <i className="fa-solid fa-comments text-gradient" style={{ fontSize: '3rem' }} />
                    </div>
                    <h3 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Welcome to Chat</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '24px' }}>
                      Select a friend from the sidebar to start a conversation, or switch to the Discover tab to connect with someone new.
                    </p>
                    <button className="btn-premium" onClick={() => setActiveTab('all')}>
                      <i className="fa-solid fa-magnifying-glass me-2" /> Discover People
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
