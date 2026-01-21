import React from 'react';
import './UsersList.css';

function UsersList({ isOpen, onClose, users, currentUser }) {
  return (
    <>
      <div className={`panel-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose}></div>
      <div className={`sliding-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Room Users ({users.length})</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="panel-content">
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
              No users in room
            </div>
          ) : (
            users.map((user, index) => (
              <div key={index} className="panel-user-item">
                <span className="user-initial">{user.charAt(0).toUpperCase()}</span>
                <span className="user-name">
                  {user === currentUser ? `${user} (You)` : user}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default UsersList; 