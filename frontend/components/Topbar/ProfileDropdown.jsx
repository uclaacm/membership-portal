'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './profileDropdown.scss';

export default function ProfileDropdown({ picture, onLogout, onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    // Opening one dropdown closes the other, so the two panels can never overlap.
    setIsOpen(prev => {
      if (!prev && onOpen) onOpen();
      return !prev;
    });
  };

  return (
    <div className="profile-dropdown" ref={wrapperRef}>
      <div className="profile-dropdown-trigger" onClick={toggleDropdown}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={picture || '/unknown.png'}
          alt="Profile"
          className="profile-avatar"
        />
        <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`} />
      </div>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fa fa-user" />
            <span>My Profile</span>
          </Link>
          <Link href="/profile/career" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fa fa-briefcase" />
            <span>Career Profile</span>
          </Link>
          <div className="dropdown-divider" />
          <button className="dropdown-item dropdown-item-signout" onClick={onLogout}>
            <i className="fa fa-sign-out-alt" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
