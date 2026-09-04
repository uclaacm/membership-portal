'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';
import Topbar from '@/components/Topbar';
import EventCard from '@/components/EventCard';
import AdminAddEvent from './AdminEvents/adminAddEvent';
import EventRSVPsModal from '@/app/controlpanel/components/EventRSVPsModal';
import CheckInModal from './CheckInModal';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchAllEvents from '@/app/actions/events/fetchAllEvents';
import createEvent from '@/app/actions/events/createEvent';
import updateEvent from '@/app/actions/events/updateEvent';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import createRSVP from '@/app/actions/rsvp/createRSVP';
import cancelRSVP from '@/app/actions/rsvp/cancelRSVP';
import checkInAction from '@/app/actions/attendance/checkIn';
import Config from '@/lib/config';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from '@/lib/atoms';
// AdminAddEvent carries no styles of its own — its overlay lives in this sheet, scoped under
// `.admin-dashboard`. The page rewrite dropped the old `./style.scss` import that used to pull
// it in, so the form rendered as an unstyled block at the foot of the page.
import './AdminEvents/style.scss';
import './eventsPage.scss';

const RANGES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All time' },
];

/**
 * One events page for every role.
 *
 * The separate `AdminEvents` / `UserEvents` branch is gone: the admin list was horizontal only
 * because that was the legacy display, and when cards were introduced only the member side was
 * updated. Here the role changes what is on the card and in the toolbar, not the layout.
 */
export default function EventsPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  // The page is role-aware on its own, but the profile menu's view switch is shared chrome and
  // still drives this atom, so it has to be threaded through.

  const [events, setEvents] = useState([]);
  const [rsvpedUuids, setRsvpedUuids] = useState({});
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [committee, setCommittee] = useState('all');
  const [range, setRange] = useState('upcoming');

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [rsvpModalEvent, setRsvpModalEvent] = useState(null);
  const [checkInOpen, setCheckInOpen] = useState(false);

  const staff = isAdmin || isOfficer;

  const loadEvents = async () => {
    const list = await fetchAllEvents();
    setEvents(list.map((e) => ({
      ...e,
      startDate: moment(e.startDate),
      endDate: moment(e.endDate),
    })));
  };

  useEffect(() => {
    const load = async () => {
      // Set inside the async body, not synchronously in the effect: a synchronous setState here
      // triggers a cascading render (react-hooks/set-state-in-effect).
      setMounted(true);
      try {
        const [, rsvpResult] = await Promise.all([loadEvents(), fetchUserRSVPs()]);
        if (rsvpResult && !rsvpResult.error) {
          const map = {};
          (rsvpResult.rsvps || []).forEach((r) => { map[r.event?.uuid ?? r.event] = true; });
          setRsvpedUuids(map);
        }
      } catch (err) {
        setError('Failed to load events');
      }
    };
    load();
  }, []);

  // Officer scoping matches the Control Panel's permission matrix: modify anything in your own
  // committee, nothing in another. Officers still *see* every event — read everywhere,
  // modify own committee.
  const canModify = (event) => {
    if (isAdmin) return true;
    if (!isOfficer) return false;
    return (userProfile?.committees || []).includes(event.committee);
  };

  const filtered = useMemo(() => {
    const now = moment();
    const needle = search.trim().toLowerCase();

    return events
      .filter((e) => {
        if (committee !== 'all' && e.committee !== committee) return false;
        if (range === 'upcoming' && e.endDate.isBefore(now)) return false;
        if (range === 'past' && e.endDate.isSameOrAfter(now)) return false;
        if (!needle) return true;
        return [e.title, e.location, e.committee]
          .some((field) => String(field ?? '').toLowerCase().includes(needle));
      })
      .sort((a, b) => (range === 'past'
        ? b.startDate.valueOf() - a.startDate.valueOf()
        : a.startDate.valueOf() - b.startDate.valueOf()));
  }, [events, search, committee, range]);

  // Group by month, preserving the order the filter produced.
  const months = useMemo(() => {
    const out = [];
    filtered.forEach((event) => {
      const key = event.startDate.format('YYYY-MM');
      let group = out.find((g) => g.key === key);
      if (!group) {
        group = { key, label: event.startDate.format('MMMM YYYY'), events: [] };
        out.push(group);
      }
      group.events.push(event);
    });
    return out;
  }, [filtered]);

  const subtitle = useMemo(() => {
    if (isAdmin) return 'Every event across the chapter. You can edit or remove any of them.';
    if (isOfficer) {
      const own = (userProfile?.committees || []).join(' and ');
      return `Every event across the chapter. You can edit the ones run by ${own || 'your committee'}.`;
    }
    return "What's coming up across every committee. RSVP to save your spot.";
  }, [isAdmin, isOfficer, userProfile]);

  const toggleRsvp = async (event) => {
    const going = !!rsvpedUuids[event.uuid];
    // Optimistic: the pill is the whole feedback mechanism, so waiting on the round trip makes
    // it feel broken.
    setRsvpedUuids((c) => ({ ...c, [event.uuid]: !going }));
    const result = going ? await cancelRSVP(event.uuid) : await createRSVP(event.uuid);
    if (result?.error) setRsvpedUuids((c) => ({ ...c, [event.uuid]: going }));
  };

  const saveEvent = async (event) => {
    const payload = {
      ...event,
      startDate: event.startDate?.toISOString?.() ?? event.startDate,
      endDate: event.endDate?.toISOString?.() ?? event.endDate,
    };
    const result = event.uuid ? await updateEvent(payload) : await createEvent(payload);
    if (result?.success) {
      await loadEvents();
      setEditing(null);
      setCreating(false);
    } else {
      setError(result?.error ?? 'Failed to save event');
    }
  };

  if (!mounted) return null;

  return (
    <div className="events-page">
      <Topbar
        isAdmin={isAdmin}
        picture={userProfile?.picture}
        onLogout={async () => { await logoutUser(); }}
        isRealAdmin={isAdmin}
        isOfficer={isOfficer}
      />

      <div className="events-page__inner">
        <h1 className="events-page__title">Events</h1>
        <p className="events-page__subtitle">{subtitle}</p>

        <div className="events-toolbar">
          <div className="events-toolbar__search">
            <i className="fa fa-search" aria-hidden="true" />
            <input
              type="text"
              value={search}
              placeholder="Search events"
              aria-label="Search events"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="events-toolbar__select"
            value={committee}
            aria-label="Filter by committee"
            onChange={(e) => setCommittee(e.target.value)}
          >
            <option value="all">All committees</option>
            {Config.committees.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="events-toolbar__select"
            value={range}
            aria-label="Filter by date range"
            onChange={(e) => setRange(e.target.value)}
          >
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          <span className="events-toolbar__spacer" />

          {staff ? (
            <button type="button" className="events-toolbar__btn is-primary" onClick={() => setCreating(true)}>
              + Add event
            </button>
          ) : (
            <button type="button" className="events-toolbar__btn is-primary" onClick={() => setCheckInOpen(true)}>
              Check in
            </button>
          )}
        </div>

        {error && <p className="events-page__subtitle">{error}</p>}

        {months.length === 0 ? (
          <div className="events-empty">
            <p>No events match those filters</p>
            <p>Try a different committee, or widen the date range.</p>
          </div>
        ) : months.map((group) => (
          <section className="events-month is-vertical" key={group.key}>
            <div className="events-month__label-vertical">{group.label}</div>
            <div className="events-grid">
              {group.events.map((event) => (
                <EventCard
                  key={event.uuid}
                  event={event}
                  staff={staff}
                  canModify={canModify(event)}
                  rsvpCount={event.rsvpCount}
                  going={!!rsvpedUuids[event.uuid]}
                  onRsvp={toggleRsvp}
                  onViewRsvps={staff ? setRsvpModalEvent : null}
                  onEdit={setEditing}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* `.admin-dashboard` is the scope every rule in AdminEvents/style.scss is nested under;
          without the wrapper the imported sheet still matches nothing. */}
      {(creating || editing) && (
        <div className="admin-dashboard">
          <AdminAddEvent
            showing
            isEdit={!!editing}
            event={editing ?? {}}
            onClickAdd={saveEvent}
            onClickCancel={() => { setEditing(null); setCreating(false); }}
          />
        </div>
      )}

      {rsvpModalEvent && (
        <EventRSVPsModal event={rsvpModalEvent} onClose={() => setRsvpModalEvent(null)} />
      )}

      {checkInOpen && (
        <CheckInModal
          onClose={() => setCheckInOpen(false)}
          onSubmit={async (code) => checkInAction(code)}
        />
      )}
    </div>
  );
}
