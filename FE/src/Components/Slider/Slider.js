import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import config from '../../config';
import './Slider.css';

const Slider = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const roomId = location.state?.room_id;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !roomId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.BaseURL}/api/users/room/${roomId}/users`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }
        
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching room users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, roomId]);

  return (
    <>
      <div className={`slider ${isOpen ? 'open' : ''}`}>
        <div className="slider-header">
          <h3>Room Users</h3>
        </div>
        <div className="slider-content">
          {loading ? (
            <div className="slider-loading">Loading users...</div>
          ) : error ? (
            <div className="slider-error">{error}</div>
          ) : users.length === 0 ? (
            <div className="slider-empty">No users in this room</div>
          ) : (
            <ul className="users-list">
              {users.map((user, index) => (
                <li key={index} className="user-item">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {isOpen && <div className="slider-overlay visible" onClick={onClose} />}
    </>
  );
};

export default Slider;
