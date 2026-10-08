import React from 'react';
import './UserCard.css';

function UserCard({ user, onClick, onConnect, onCancel, isActive }) {
  const handleClick = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    onClick();
  };

  return (
    <div 
      className={`user-card p-3 border-bottom ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      style={{ cursor: user.connectionStatus === 'friends' ? 'pointer' : 'default' }}
    >
      <div className="d-flex align-items-center">
        <div className="me-3">
          <div 
            className="user-avatar rounded-circle text-primary d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '50px', height: '50px', fontSize: '20px' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-grow-1">
          <h6 className="mb-1">{user.name}</h6>
          {user.bio && <small className="text-muted d-block mb-1">{user.bio}</small>}
          <div className="d-flex align-items-center">
            <span className={`online-indicator ${user.status === 'online' ? 'online' : 'offline'}`}></span>
            <small className={user.status === 'online' ? 'text-success' : 'text-muted'}>
              {user.status === 'online' ? 'Online' : 'Offline'}
            </small>
          </div>
          <div className="mt-2">
            {user.connectionStatus === 'none' && (
              <button className="btn btn-sm btn-primary connection-btn" onClick={onConnect}>Connect</button>
            )}
            {user.connectionStatus === 'waiting' && (
              <>
                <span className="connection-status waiting">⏳ Waiting...</span>
                <button className="btn btn-sm btn-outline-secondary connection-btn ms-2" onClick={onCancel}>Cancel</button>
              </>
            )}
            {user.connectionStatus === 'received' && (
              <>
                <span className="connection-status received">📩 Wants to connect</span>
                <button className="btn btn-sm btn-success connection-btn ms-2" onClick={onConnect}>Accept</button>
              </>
            )}
            {user.connectionStatus === 'friends' && (
              <span className="connection-status friends">✓ Friends</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
