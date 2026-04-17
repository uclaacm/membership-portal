'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import Profile from './profile';
import moment from 'moment';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchActivity from '@/app/actions/user/fetchActivity';
import updateUser from '@/app/actions/user/updateUser';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from '@/lib/atoms';
import './style.scss';

export default function ProfilePage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [activity, setActivity] = useState(null);
  const [activityError, setActivityError] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      setMounted(true);
      try {
        const data = await fetchActivity();
        if (data) setActivity(data.map(a => ({ ...a, date: moment(a.date) })));
        else setActivityError('Failed to load activity');
      } catch {
        setActivityError('Failed to load activity');
      }
    };
    init();
  }, []);

  const handleSaveChanges = async (newProfile) => {
    const result = await updateUser(newProfile);
    setUpdated(true);
    setUpdateSuccess(result.success);
    setUpdateError(result.error ?? null);
    setTimeout(() => setUpdated(false), 3000);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!mounted) return null;

  const profile = userProfile ? {
    name: `${userProfile.firstName} ${userProfile.lastName}`,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    major: userProfile.major,
    year: userProfile.year,
    points: userProfile.points,
    picture: userProfile.picture,
  } : {};

  return (
    <div className="profile">
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
      <Profile
        profile={profile}
        updated={updated}
        updateSuccess={updateSuccess}
        updateError={updateError}
        saveChanges={handleSaveChanges}
        logout={handleLogout}
        activity={activity}
        activityError={activityError}
        adminView={adminView}
        isAdmin={isAdmin}
      />
    </div>
  );
}
