'use client';

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import UserEvents from './UserEvents';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchFutureEvents from '@/app/actions/events/fetchFutureEvents';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import { authUserProfileAtom } from '@/lib/atoms';
import './style.scss';

export default function EventsPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const [events, setEvents] = useState([]);
  const [userRsvps, setUserRsvps] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const loadEvents = async () => {
      try {
        const [eventsResult, rsvpResult] = await Promise.all([
          fetchFutureEvents(),
          fetchUserRSVPs(),
        ]);

        if (eventsResult.error) {
          setError(eventsResult.error);
        } else {
          setEvents(eventsResult.events || []);
        }

        if (!rsvpResult.error) {
          setUserRsvps(rsvpResult.rsvps || []);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events');
      }
    };

    loadEvents();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="events">
      <Topbar 
        isAdmin={false}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={false}
        adminView={false}
      />
      <UserEvents 
        events={events}
        userRsvps={userRsvps}
        error={error}
      />
    </div>
  );
}
