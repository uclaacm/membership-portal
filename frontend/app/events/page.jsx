'use client';

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import moment from 'moment';
import Topbar from '@/components/Topbar';
import UserEvents from './UserEvents';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchFutureEvents from '@/app/actions/events/fetchFutureEvents';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import checkInAction from '@/app/actions/attendance/checkIn';
import { authUserProfileAtom } from '@/lib/atoms';
import './style.scss';

export default function EventsPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const [events, setEvents] = useState([]);
  const [userRsvps, setUserRsvps] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInPoints, setCheckInPoints] = useState(0);
  const [checkInError, setCheckInError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    const loadEvents = async () => {
      try {
        const [eventsArray, rsvpResult] = await Promise.all([
          fetchFutureEvents(),
          fetchUserRSVPs(),
        ]);

        setEvents(eventsArray.map(e => ({
          ...e,
          startDate: moment(e.startDate),
          endDate: moment(e.endDate),
        })));

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

  const handleCheckIn = async (attendanceCode) => {
    const result = await checkInAction(attendanceCode);
    setCheckInSubmitted(true);
    setCheckInSuccess(result.success);
    setCheckInPoints(result.points ?? 0);
    setCheckInError(result.error ?? '');
  };

  const handleResetCheckIn = () => {
    setCheckInSubmitted(false);
    setCheckInSuccess(false);
    setCheckInPoints(0);
    setCheckInError('');
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
        checkIn={handleCheckIn}
        checkInSubmitted={checkInSubmitted}
        checkInSuccess={checkInSuccess}
        checkInPoints={checkInPoints}
        checkInError={checkInError}
        resetCheckIn={handleResetCheckIn}
      />
    </div>
  );
}
