'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';

import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from '@/lib/atoms';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchLeaderboard from '@/app/actions/leaderboard/fetchLeaderboard';
import fetchFutureEvents from '@/app/actions/events/fetchFutureEvents';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import createRSVP from '@/app/actions/rsvp/createRSVP';
import cancelRSVP from '@/app/actions/rsvp/cancelRSVP';
import checkIn from '@/app/actions/attendance/checkIn';
import Topbar from '@/components/Topbar';

import Hero from './components/Hero';
import CheckInCard from './components/CheckInCard';
import ProgressCard from './components/ProgressCard';
import LeaderboardRail from './components/LeaderboardRail';
import FeaturedEvents from './components/FeaturedEvents';
import LeaderboardModal from './components/LeaderboardModal';
import { useFitCount, useMediaQuery } from './useFit';
import './dashboard.scss';

// Intrinsic item sizes, used only as fallbacks before the real boxes have rendered — the hook
// prefers the measured box. See the fit rules in useFit.js.
// The shared preview card is authored at 230px wide.
const CARD_MIN_WIDTH = 230;
const ROW_HEIGHT = 60;
const BOARD_ROW_HEIGHT = 32;
// The handoff capped this at 3. Lifted so the available width decides — on a wide screen
// three cards left an obvious gap where a fourth fits.
const MAX_CARDS = 6;

// Below this width the page scrolls instead of fitting a fixed height, so the counts are fixed
// rather than computed. Matches the SCSS breakpoint.
const MOBILE_QUERY = '(max-width: 860px)';
const MOBILE_ROWS = 3;
const MOBILE_BOARD = 6;

// Seed counts used until the first successful measurement. They must be plausible, not
// minimal: starting from the minimum renders a one-item dashboard on the first paint.
const INITIAL_CARDS = 3;
const INITIAL_ROWS = 3;
const INITIAL_BOARD = 8;

// The modal shows the full ranking, so it needs far more than the rail's handful of rows —
// otherwise someone ranked #34 opens it and still cannot find themselves.
const MODAL_BOARD = 100;

export default function HomePage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);

  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState([]);
  const [board, setBoard] = useState([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [me, setMe] = useState({ uuid: null, rank: null, points: 0 });
  const [rsvped, setRsvped] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  // How many items the last fetch asked for, so a resize only refetches when the new fit needs
  // more than we already hold. Shrinking just re-slices.
  const fetchedEvents = useRef(0);
  const fetchedBoard = useRef(0);

  const cardsRef = useRef(null);
  const rowsRef = useRef(null);
  const boardRef = useRef(null);

  const narrow = useMediaQuery(MOBILE_QUERY);

  const cardCount = useFitCount(cardsRef, {
    axis: 'column',
    fallbackSize: CARD_MIN_WIDTH,
    initial: INITIAL_CARDS,
    min: 1,
    max: MAX_CARDS,
    enabled: !narrow,
    disabledValue: 1,
    recomputeKey: events.length,
  });

  const rowCount = useFitCount(rowsRef, {
    axis: 'row',
    fallbackSize: ROW_HEIGHT,
    initial: INITIAL_ROWS,
    min: 0,
    enabled: !narrow,
    disabledValue: MOBILE_ROWS,
    recomputeKey: events.length,
  });

  const boardCount = useFitCount(boardRef, {
    axis: 'row',
    fallbackSize: BOARD_ROW_HEIGHT,
    initial: INITIAL_BOARD,
    min: 1,
    enabled: !narrow,
    disabledValue: MOBILE_BOARD,
    recomputeKey: board.length,
  });

  // ------------------------------------------------------------------ loading

  const loadEvents = useCallback(async (want) => {
    // Ask for a little more than fits so a small widening re-slices instead of refetching.
    const limit = Math.max(1, want) + MAX_CARDS;
    const list = await fetchFutureEvents(limit);
    fetchedEvents.current = limit;
    // Dates arrive as ISO strings; the cards and rows format them with moment.
    setEvents(list.map((event) => ({
      ...event,
      startDate: moment(event.startDate),
      endDate: moment(event.endDate),
    })));
  }, []);

  const loadBoard = useCallback(async (want) => {
    const limit = Math.max(1, want) + 4;
    const result = await fetchLeaderboard(limit);
    fetchedBoard.current = limit;
    setBoard(result.leaderboard);
    setMemberTotal(result.total);
    setMe(result.me);
  }, []);

  useEffect(() => {
    const init = async () => {
      setMounted(true);
      await Promise.all([
        loadEvents(INITIAL_CARDS + INITIAL_ROWS),
        loadBoard(INITIAL_BOARD),
        fetchUserRSVPs().then((result) => {
          if (!result.success) return;
          setRsvped(Object.fromEntries(
            (result.rsvps ?? []).map((r) => [r.event?.uuid ?? r.event, true]),
          ));
        }),
      ]);
    };
    init();
  }, [loadEvents, loadBoard]);

  // Refetch only when the fit outgrows what we hold; otherwise the render below re-slices.
  useEffect(() => {
    const want = cardCount + rowCount;
    const run = async () => {
      if (mounted && want > fetchedEvents.current) await loadEvents(want);
    };
    run();
  }, [mounted, cardCount, rowCount, loadEvents]);

  useEffect(() => {
    const run = async () => {
      if (mounted && boardCount > fetchedBoard.current) await loadBoard(boardCount);
    };
    run();
  }, [mounted, boardCount, loadBoard]);

  // ------------------------------------------------------------------ actions

  // Opening the modal pulls a much deeper page than the rail needs. Fetched on open rather
  // than upfront so the dashboard's first paint is not waiting on a hundred rows.
  const openBoard = async () => {
    setModalOpen(true);
    if (fetchedBoard.current < MODAL_BOARD) await loadBoard(MODAL_BOARD);
  };

  const handleCheckIn = async (code) => {
    const result = await checkIn(code);
    if (result.success) await loadBoard(boardCount);
    return result;
  };

  const handleToggleRsvp = async (event) => {
    const going = !!rsvped[event.uuid];
    // Optimistic: the button is the feedback, and a round trip before it moves feels broken.
    setRsvped((current) => ({ ...current, [event.uuid]: !going }));

    const result = going ? await cancelRSVP(event.uuid) : await createRSVP(event.uuid);
    if (!result.success) {
      setRsvped((current) => ({ ...current, [event.uuid]: going }));
    }
  };

  if (!mounted) return null;

  const firstName = userProfile?.firstName || 'there';
  const points = userProfile?.points ?? me.points ?? 0;

  const upcomingThisWeek = events.filter(
    (e) => moment(e.startDate).isBefore(moment().add(7, 'days')),
  ).length;

  const subline = upcomingThisWeek > 0
    ? `You have ${upcomingThisWeek} event${upcomingThisWeek === 1 ? '' : 's'} coming up this week.`
    : 'Nothing on your calendar this week.';

  let position = 'Member';
  if (isAdmin) position = 'Admin';
  else if (isOfficer) position = (userProfile?.committees ?? [])[0] || 'Officer';

  return (
    <>
      <Topbar
        picture={userProfile?.picture}
        onLogout={() => logoutUser()}
        isRealAdmin={isAdmin}
        isOfficer={isOfficer}
      />

      <div className="dash-root">
        <div className="dash-shell">
          {/* aside and main become `display: contents` on mobile so their cards join one
              column and each card's `order` sets the sequence. */}
          <aside className="dash-rail">
            <CheckInCard onCheckIn={handleCheckIn} />
            <ProgressCard points={points} />
            <LeaderboardRail
              listRef={boardRef}
              board={board}
              count={boardCount}
              me={me}
              onViewAll={openBoard}
            />
          </aside>

          <main className="dash-main">
            <Hero
              firstName={firstName}
              picture={userProfile?.picture}
              subline={subline}
              position={position}
              rank={me.rank}
            />
            <FeaturedEvents
              cardsRef={cardsRef}
              rowsRef={rowsRef}
              events={events}
              cardCount={cardCount}
              rowCount={rowCount}
              rsvped={rsvped}
              onToggleRsvp={handleToggleRsvp}
            />
          </main>
        </div>
      </div>

      <LeaderboardModal
        open={modalOpen}
        board={board}
        me={me}
        memberCount={memberTotal}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
