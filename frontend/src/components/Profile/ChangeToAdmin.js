// src/components/ChangeToAdmin.jsx
import React, { useState } from 'react';
import Button from 'components/Button';
import Config from 'config';
import './ChangeToAdmin.scss';

const ChangeToAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePromoteClick = () => {
    setShowModal(true);
    setMessage('');
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(Config.API_URL + Config.routes.admin.promote, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Error in POST request:', error);
      setMessage('❌ An unknown error occurred.');
    } finally {
      setPassword('');
    }
  };

  return (
    <div>
      <Button
        onClick={handlePromoteClick}
        className="control-panel-action-button"
        color="blue"
        text="Register as an Officer"
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Register Officer Account</h2>
            <input
              type="text"
              placeholder="User Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
            <button onClick={() => setShowModal(false)} className="cancel-button">
              Cancel
            </button>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeToAdmin;
