'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavigationItem from './NavigationItem';
import ProfileDropdown from './ProfileDropdown';
import Config from '@/lib/config';
import './styles.scss';

export default function Topbar({ isAdmin, picture, onLogout, isRealAdmin, adminView, onToggleAdminView, isOfficer, officerView, onToggleOfficerView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const sharedLinks = (
    <>
      <Link href="/home" className={pathname === '/home' ? 'selected' : ''}>
        <NavigationItem text="Home" />
      </Link>
      <Link href="/events" className={pathname === '/events' ? 'selected' : ''}>
        <NavigationItem text="Events" />
      </Link>
      <Link href="/leaderboard" className={pathname === '/leaderboard' ? 'selected' : ''}>
        <NavigationItem text={isAdmin ? 'Members' : 'Leaderboard'} />
      </Link>
      <Link href="/resources" className={pathname === '/resources' ? 'selected' : ''}>
        <NavigationItem text={isAdmin ? 'Organization' : 'Resources'} />
      </Link>
      <Link href="/profile/career" className={pathname.startsWith('/profile/career') ? 'selected' : ''}>
        <NavigationItem text="Career Hub" />
      </Link>
    </>
  );

  return (
    <div className="topbar">
      <div className="topbar-container">
        <div className="topbar-logo">
          <img src="/new_acm_wordmark_chapter.png" alt={Config.organization.name} />
        </div>

        <div className={`topbar-links ${menuOpen ? 'open' : ''}`}>
          {sharedLinks}

          {/* Control Panel for admins and officers */}
          {(isAdmin || isOfficer) && (
            <Link href="/controlpanel" className={pathname === '/controlpanel' ? 'selected' : ''}>
              <NavigationItem text="Control Panel" />
            </Link>
          )}

          {/* Mobile only items */}
          <Link href="/profile" className={`topbar-mobile-only ${pathname === '/profile' ? 'selected' : ''}`}>
            <NavigationItem text="Profile" />
          </Link>

          {(isRealAdmin || isOfficer) && (
            <a className="topbar-mobile-only" onClick={isRealAdmin ? onToggleAdminView : onToggleOfficerView}>
              <div className="navigation-item">
                <span>{isRealAdmin ? (adminView ? 'Member View' : 'Admin View') : (officerView ? 'Member View' : 'Officer View')}</span>
              </div>
            </a>
          )}

          <a className="topbar-mobile-only signout-link" onClick={onLogout}>
            <div className="navigation-item">
              <span>Sign Out</span>
            </div>
          </a>
        </div>

        {/* Hamburger Button (Mobile only) */}
        <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
        </div>

        {/* Profile Icon (Desktop only) */}
        <ProfileDropdown
          picture={picture}
          onLogout={onLogout}
          isAdmin={isRealAdmin}
          adminView={adminView}
          onToggleAdminView={onToggleAdminView}
          isOfficer={isOfficer}
          officerView={officerView}
          onToggleOfficerView={onToggleOfficerView}
        />
      </div>
    </div>
  );
}
