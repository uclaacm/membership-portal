'use client';

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import UserEvents from './UserEvents';
import Config from '@/lib/config';
import { authUserProfileAtom } from '@/lib/atoms';
import CookieStore from '@/lib/cookieStore';
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
        const token = CookieStore.get('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        
        // Fetch events
        const eventsResponse = await fetch(Config.API_URL + Config.routes.events.future, {
          headers,
        });
        const eventsData = await eventsResponse.json();
        
        if (eventsData.error) {
          setError(eventsData.error);
        } else {
          setEvents(eventsData.events || []);
        }

        // Fetch user RSVPs
        const rsvpResponse = await fetch(Config.API_URL + Config.routes.rsvp.get, {
          headers,
        });
        const rsvpData = await rsvpResponse.json();
        
        if (!rsvpData.error) {
          setUserRsvps(rsvpData.rsvps || []);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events');
      }
    };

    loadEvents();
  }, []);

  const handleLogout = () => {
    window.location.href = Config.API_URL + Config.routes.auth.logout;
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
