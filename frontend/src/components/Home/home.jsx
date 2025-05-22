import React from 'react';
import WelcomeBanner from 'components/Home/WelcomeBanner';
import PropTypes from 'prop-types';
import Points from './points';

import './styles.scss';
import FeaturedEvents from './featuredEvents';
import EventCard from '../Events/UserEvents/eventCard';

const NUMBER_LEADERBOARD_USERS = 10;

const Home = ({
  isAdmin,
  isSuperAdmin,
  adminView,
  picture,
  username,
  checkIn,
  checkInPoints,
  checkInSuccess,
  checkInError,
  points,
  leaderboard,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    checkIn(e.target.attendanceCode.value);
  };

  /* HARD CODED FOR TESTING PURPOSES */
  const event = (
    <EventCard event={{
      attendancePoints: '50',
      committee: 'ICPC',
      cover: '',
      description: 'description',
      endDate: null, // endTime
      eventLink: '',
      location: 'Boelter 1293',
      startDate: null, // startTime
      title: 'Very fun event',
      startTime: '6:00 PM',
    }}
    />
  );
  const eventArray = [event, event, event, event];

  return (
    <div className="home-dashboard">
      {/* Sidebar */}
      <aside className="sidebar-custom">
        <div className="sidebar-box event-checkin">
          <h3>Event Check-In</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="attendanceCode"
              placeholder="Enter Check-In Code"
            />
            <button type="submit" className="check-btn" aria-label="Check in" />
          </form>
          {checkInError && (
            <>
              <br />
              <span className="CaptionSecondary error">
                <span role="img" aria-label="cross mark">❌</span>
                {checkInError}
              </span>
            </>
          )}
          {checkInSuccess && (
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
          <Points points={points} />
        </div>

        <div className="sidebar-box leaderboard">
          <h3>Leaderboard</h3>
          <ul className="leaderboard-list-container">
            {leaderboard.slice(0, NUMBER_LEADERBOARD_USERS).map((user, index) => (
              <li key={user.id}>
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
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          adminView={adminView}
          picture={picture}
          username={username}
        />
        <FeaturedEvents title="Featured Events" events={eventArray} />

      </main>
    </div>
  );
};

Home.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  adminView: PropTypes.bool.isRequired,
  picture: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  checkIn: PropTypes.func.isRequired,
  checkInPoints: PropTypes.number.isRequired,
  checkInSuccess: PropTypes.bool.isRequired,
  checkInError: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  leaderboard: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
};

export default Home;
