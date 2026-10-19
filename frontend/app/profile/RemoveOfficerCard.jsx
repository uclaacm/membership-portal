'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';
import Config from '@/lib/config';
import CookieStore from '@/lib/cookieStore';
import './RemoveOfficerCard.scss';

const COMMITTEES = Config.committees;

const getResponseMessage = (data, fallback) => {
  const value = data?.message || data?.error;

  if (typeof value === 'string') return value;
  if (value && typeof value.message === 'string') return value.message;

  return fallback;
};

const RemoveOfficerCard = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [committee, setCommittee] = useState('');
  const [message, setMessage] = useState({ text: '', success: false });
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    setShowModal(true);
    setEmail('');
    setCommittee('');
    setMessage({ text: '', success: false });
  };

  const selectCommittee = (c) => {
    setCommittee(c);
  };

  const removeOfficerFromCommittee = async () => {
    const token = CookieStore.get('token');
    const response = await fetch(Config.API_URL + Config.routes.admin.promoteOfficer, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, committees: [committee] }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  };

  const handleSubmit = async () => {
    if (!email) {
      setMessage({ text: 'Email is required.', success: false });
      return;
    }
    if (!committee) {
      setMessage({ text: 'Select the committee to remove them from.', success: false });
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await removeOfficerFromCommittee();
      if (ok) {
        setMessage({ text: getResponseMessage(data, 'Officer assignment removed.'), success: true });
        setCommittee('');
      } else {
        setMessage({ text: getResponseMessage(data, 'Something went wrong.'), success: false });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={openModal} color="red" text="Remove Officer" />

      {showModal && (
        <div className="ro-overlay" onClick={() => setShowModal(false)}>
          <div className="ro-modal" onClick={e => e.stopPropagation()}>
            <h2 className="ro-title">Remove Officer from Committee</h2>

            <div className="ro-field">
              <label className="ro-label">Email</label>
              <input
                className="ro-input"
                type="email"
                placeholder="user@g.ucla.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="ro-field">
              <label className="ro-label">Committee</label>
              <div className="ro-committee-grid">
                {COMMITTEES.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`ro-chip ${committee === c ? 'selected' : ''}`}
                    onClick={() => selectCommittee(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="ro-help">
                Officers belong to one committee. Select the committee they are on to remove them; they will be demoted to standard member.
              </p>
            </div>

            {message.text && (
              <p className={`ro-message ${message.success ? 'success' : 'error'}`}>
                {message.text}
              </p>
            )}

            <div className="ro-actions">
              <Button text="Remove" color="red" onClick={handleSubmit} loading={loading} />
              <Button text="Cancel" color="blue" onClick={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RemoveOfficerCard;
