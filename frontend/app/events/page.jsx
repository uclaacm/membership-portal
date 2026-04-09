'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';
import Topbar from '@/components/Topbar';
import UserEvents from './UserEvents';
import AdminEvents from './AdminEvents';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchFutureEvents from '@/app/actions/events/fetchFutureEvents';
import createEvent from '@/app/actions/events/createEvent';
import updateEvent from '@/app/actions/events/updateEvent';
import syncEventsAction from '@/app/actions/events/syncEvents';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import checkInAction from '@/app/actions/attendance/checkIn';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from '@/lib/atoms';
import './style.scss';

export default function EventsPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [officerView, setOfficerView] = useAtom(officerViewAtom);
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

  const normalizeEventForServer = (event) => ({
    ...event,
    startDate: event.startDate ? event.startDate.toISOString?.() ?? event.startDate : null,
    endDate: event.endDate ? event.endDate.toISOString?.() ?? event.endDate : null,
  });

  const handleAddEvent = async (event) => {
    try {
      await createEvent(normalizeEventForServer(event));
      // Reload events after creation
      const eventsArray = await fetchFutureEvents();
      setEvents(eventsArray.map(e => ({
        ...e,
        startDate: moment(e.startDate),
        endDate: moment(e.endDate),
      })));
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event');
    }
  };

  const handleUpdateEvent = async (event) => {
    try {
      await updateEvent(normalizeEventForServer(event));
      const eventsArray = await fetchFutureEvents();
      setEvents(eventsArray.map(e => ({
        ...e,
        startDate: moment(e.startDate),
        endDate: moment(e.endDate),
      })));
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Failed to update event');
    }
  };

  const handleSyncEvents = async () => {
    try {
      await syncEventsAction();
      const eventsArray = await fetchFutureEvents();
      setEvents(eventsArray.map(e => ({
        ...e,
        startDate: moment(e.startDate),
        endDate: moment(e.endDate),
      })));
    } catch (err) {
      console.error('Failed to sync events:', err);
      setError('Failed to sync events');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="events">
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView(v => !v)}
        isOfficer={isOfficer}
        officerView={adminView}
        onToggleOfficerView={() => setAdminView(v => !v)}
      />
      {(isAdmin || isOfficer) && adminView ? (
        <AdminEvents
          events={events}
          error={error}
          isAdmin={isAdmin}
          isOfficer={isOfficer}
          addEvent={handleAddEvent}
          updateEvent={handleUpdateEvent}
          syncEvents={handleSyncEvents}
        />
      ) : (
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
      )}
    </div>
  );
}
