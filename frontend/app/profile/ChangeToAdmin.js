'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';
import Config from '@/lib/config';
import CookieStore from '@/lib/cookieStore';
import './ChangeToAdmin.scss';

const COMMITTEES = Config.committees;

const ChangeToAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OFFICER');
  const [committees, setCommittees] = useState([]);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', success: false });
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    setShowModal(true);
    setEmail('');
    setRole('OFFICER');
    setCommittees([]);
    setPassword('');
    setMessage({ text: '', success: false });
  };

  const toggleCommittee = (c) => {
    setCommittees(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleSubmit = async () => {
    if (!email) {
      setMessage({ text: 'Email is required.', success: false });
      return;
    }
    setLoading(true);
    try {
      let response;
      if (role === 'OFFICER') {
        const token = CookieStore.get('token');
        response = await fetch(Config.API_URL + Config.routes.admin.promoteOfficer, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, committees }),
        });
      } else {
        response = await fetch(Config.API_URL + Config.routes.admin.promote, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, success: true });
      } else {
        setMessage({ text: data.error || 'Something went wrong.', success: false });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', success: false });
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <>
      <Button onClick={openModal} color="blue" text="Assign Role" />

      {showModal && (
        <div className="ar-overlay" onClick={() => setShowModal(false)}>
          <div className="ar-modal" onClick={e => e.stopPropagation()}>
            <h2 className="ar-title">Assign Role</h2>

            <div className="ar-field">
              <label className="ar-label">Email</label>
              <input
                className="ar-input"
                type="email"
                placeholder="user@g.ucla.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="ar-field">
              <label className="ar-label">Role</label>
              <div className="ar-role-tabs">
                <button
                  className={`ar-role-tab ${role === 'OFFICER' ? 'active' : ''}`}
                  onClick={() => setRole('OFFICER')}
                  type="button"
                >
                  Officer
                </button>
                <button
                  className={`ar-role-tab ${role === 'ADMIN' ? 'active' : ''}`}
                  onClick={() => setRole('ADMIN')}
                  type="button"
                >
                  Admin
                </button>
              </div>
            </div>

            {role === 'OFFICER' && (
              <div className="ar-field">
                <label className="ar-label">Committees</label>
                <div className="ar-committee-grid">
                  {COMMITTEES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`ar-chip ${committees.includes(c) ? 'selected' : ''}`}
                      onClick={() => toggleCommittee(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {role === 'ADMIN' && (
              <div className="ar-field">
                <label className="ar-label">Admin Password</label>
                <input
                  className="ar-input"
                  type="password"
                  placeholder="Required for admin promotion"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            )}

            {message.text && (
              <p className={`ar-message ${message.success ? 'success' : 'error'}`}>
                {message.text}
              </p>
            )}

            <div className="ar-actions">
              <Button text="Assign" color="blue" onClick={handleSubmit} loading={loading} />
              <Button text="Cancel" color="red" onClick={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeToAdmin;
