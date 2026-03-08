"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import moment from "moment";

import { authUserProfileAtom } from "@/lib/atoms";
import logoutUser from "@/app/actions/auth/logoutUser";
import fetchLeaderboard from "@/app/actions/leaderboard/fetchLeaderboard";
import fetchFutureEvents from "@/app/actions/events/fetchFutureEvents";
import checkIn from "@/app/actions/attendance/checkIn";
import Topbar from "@/components/Topbar";
import WelcomeBanner from "./components/WelcomeBanner";
import FeaturedEvents from "./components/featuredEvents";
import Points from "./components/points";
import EventCard from "@/app/events/UserEvents/eventCard";
import "@/app/events/UserEvents/style.scss";
import "./components/styles.scss";

const NUMBER_LEADERBOARD_USERS = 10;
const NUMBER_FEATURED_EVENTS = 5;

const getRecentEvents = (events) => {
  if (!events || !Array.isArray(events)) return [];
  
  return events
    .filter(event => event.startDate.isSameOrAfter(moment(), 'day'))
    .sort((a, b) => a.startDate.diff(b.startDate))
    .slice(0, NUMBER_FEATURED_EVENTS);
};

export default function HomePage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const [mounted, setMounted] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [checkInPoints, setCheckInPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      try {
        const [leaderboardData, eventsData] = await Promise.all([
          fetchLeaderboard(),
          fetchFutureEvents(),
        ]);
        setLeaderboard(leaderboardData);
        setEvents(eventsData.map(e => ({
          ...e,
          startDate: moment(e.startDate),
          endDate: moment(e.endDate),
        })));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkInCode.trim()) return;

    setCheckInStatus(null);

    try {
      const result = await checkIn(checkInCode);
      if (!result.success) {
        setCheckInStatus("error");
        setCheckInPoints(0);
      } else {
        setCheckInStatus("success");
        setCheckInPoints(result.points ?? 0);
        setCheckInCode("");
        setTimeout(() => setCheckInStatus(null), 5000);
      }
    } catch (error) {
      setCheckInStatus("error");
      setCheckInPoints(0);
    }
  };

  if (!mounted) {
    return null;
  }

  const recentEvents = getRecentEvents(events);
  const eventCards = recentEvents.map(event => (
    <EventCard key={event.uuid} event={event} />
  ));

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="home-dashboard">
      <Topbar 
        isAdmin={false}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={false}
        adminView={false}
      />
      
      {/* Sidebar */}
      <aside className="sidebar-custom">
        <div className="sidebar-box event-checkin">
          <h3>Event Check-In</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="attendanceCode"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
              placeholder="Enter Check-In Code"
            />
            <button type="submit" className="check-btn" aria-label="Check in" />
          </form>
          {checkInStatus === "error" && (
            <>
              <br />
              <span className="CaptionSecondary error">
                <span role="img" aria-label="cross mark">❌</span>
                Check-in failed
              </span>
            </>
          )}
          {checkInStatus === "success" && (
            <>
              <br />
              <span className="CaptionSecondary success">
                <span role="img" aria-label="check mark">✅</span>
                {' '}
                {checkInPoints}
                {' '}
                points awarded!
              </span>
            </>
          )}
        </div>

        <div className="sidebar-box progress">
          <h3>Your Progress</h3>
          <Points points={userProfile?.points || 0} />
        </div>

        <div className="sidebar-box leaderboard">
          <h3>Leaderboard</h3>
          <ul className="leaderboard-list-container">
            {leaderboard.slice(0, NUMBER_LEADERBOARD_USERS).map((user, index) => (
              <li key={index}>
                {index + 1}
                {' - '}
                {user.firstName}
                {' '}
                {user.lastName}
                <span>
                  {user.points}
                  {' '}
                  pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Section */}
      <main className="main-section">
        <WelcomeBanner
          isAdmin={false}
          isSuperAdmin={false}
          adminView={false}
          picture={userProfile?.picture}
          username={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Member'}
        />
        <FeaturedEvents title="Featured Events" events={eventCards} />
      </main>
    </div>
  );
}
