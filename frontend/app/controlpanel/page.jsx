'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import ControlPanel from './controlPanel';
import moment from 'moment';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchAllEvents from '@/app/actions/events/fetchAllEvents';
import deleteEventAction from '@/app/actions/events/deleteEvent';
import fetchImages from '@/app/actions/image/fetchImages';
import deleteImageAction from '@/app/actions/image/deleteImage';
import fetchAdmins from '@/app/actions/user/fetchAdmins';
import addAdmin from '@/app/actions/user/addAdmin';
import removeAdmin from '@/app/actions/user/removeAdmin';
import reassignAdmin from '@/app/actions/user/reassignAdmin';
import changeOneClickPassword from '@/app/actions/auth/changeOneClickPassword';
import syncEventsAction from '@/app/actions/events/syncEvents';
import Config from '@/lib/config';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from '@/lib/atoms';
import './style.scss';
import { isTokenSuperAdmin } from '@/lib/token';
import CookieStore from '@/lib/cookieStore';

export default function ControlPanelPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);

  const [events, setEvents] = useState([]);
  const [images, setImages] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [oneClickUpdated, setOneClickUpdated] = useState(false);
  const [oneClickUpdateSuccess, setOneClickUpdateSuccess] = useState(false);
  const [oneClickError, setOneClickError] = useState('');

  const [eventDeleteError, setEventDeleteError] = useState(null);
  const [imageDeleteError, setImageDeleteError] = useState(null);
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAllEvents().then(evts => setEvents(evts.map(e => ({ ...e, startDate: moment(e.startDate) }))));
    fetchImages().then(setImages);

    const token = CookieStore.get('token');
    if (token) {
      fetch(`${Config.API_URL}/api/v1/sheets/info`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => { if (data.serviceAccountEmail) setServiceAccountEmail(data.serviceAccountEmail); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = CookieStore.get('token');
    if (isTokenSuperAdmin(token || '')) {
      fetchAdmins().then(setAdmins);
    }
  }, [mounted]);

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleDeleteEvent = async (uuid) => {
    const result = await deleteEventAction(uuid);
    if (!result.success) {
      setEventDeleteError(result.error ?? 'Failed to delete event');
    } else {
      setEventDeleteError(null);
      fetchAllEvents().then(evts => setEvents(evts.map(e => ({ ...e, startDate: moment(e.startDate) }))));
    }
  };

  const handleDeleteImage = async (uuid) => {
    const result = await deleteImageAction(uuid);
    if (!result.success) {
      setImageDeleteError(result.error ?? 'Failed to delete image');
    } else {
      setImageDeleteError(null);
      fetchImages().then(setImages);
    }
  };

  const handleAddAdmin = async (email) => {
    await addAdmin(email);
    fetchAdmins().then(setAdmins);
  };

  const handleRemoveAdmin = async (email) => {
    await removeAdmin(email);
    fetchAdmins().then(setAdmins);
  };

  const handleReassignAdmin = async (email) => {
    await reassignAdmin(email);
    await logoutUser();
  };

  const handleSyncEvents = async (sheetUrl) => {
    return await syncEventsAction(sheetUrl);
  };

  const handleChangeOneClickPassword = async (oldPassword, newPassword) => {
    const result = await changeOneClickPassword(oldPassword, newPassword);
    setOneClickUpdated(true);
    setOneClickUpdateSuccess(result.success);
    setOneClickError(result.error ?? '');
    setTimeout(() => setOneClickUpdated(false), 3000);
  };

  if (!mounted) return null;

  const token = CookieStore.get('token');
  const isSuperAdmin = isTokenSuperAdmin(token || '');
  const officerCommittees = userProfile?.committees ?? [];

  return (
    <div className="controlpanel">
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
      <ControlPanel
        isAdmin={isAdmin}
        isOfficer={isOfficer}
        officerCommittees={officerCommittees}
        isSuperAdmin={isSuperAdmin}
        logout={handleLogout}
        userEmail={userProfile?.email ?? ''}
        events={events}
        deleteEvent={handleDeleteEvent}
        images={images}
        deleteImage={handleDeleteImage}
        admins={admins}
        addAdmin={handleAddAdmin}
        removeAdmin={handleRemoveAdmin}
        reassignAdmin={handleReassignAdmin}
        changeOneClickPassword={handleChangeOneClickPassword}
        oneClickUpdated={oneClickUpdated}
        oneClickUpdateSuccess={oneClickUpdateSuccess}
        oneClickError={oneClickError}
        eventDeleteError={eventDeleteError}
        imageDeleteError={imageDeleteError}
        adminView={adminView}
        toggleAdminView={() => setAdminView(v => !v)}
        syncEvents={handleSyncEvents}
        serviceAccountEmail={serviceAccountEmail}
      />
    </div>
  );
}
