'use client';

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import levelFor from './levels';

function Podium({ user, place, size }) {
  if (!user) return <div className="dash-podium-slot" />;

  return (
    <div className={`dash-podium-slot place-${place}`}>
      <span className="dash-podium-place">{place === 1 ? '1st' : `${place}${place === 2 ? 'nd' : 'rd'}`}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="dash-podium-avatar"
        src={user.picture || '/unknown.png'}
        alt=""
        style={{ width: size, height: size }}
      />
      <span className="dash-podium-name">{user.firstName} {user.lastName}</span>
      <span className="dash-podium-level">{levelFor(user.points).name}</span>
      <span className="dash-podium-points">{(user.points ?? 0).toLocaleString('en-US')} pts</span>
    </div>
  );
}

Podium.propTypes = {
  user: PropTypes.object,
  place: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
};

Podium.defaultProps = { user: null };

/**
 * The full ranking, replacing the deleted /leaderboard page.
 *
 * Dismissed by backdrop click, the ✕, and Escape. The panel stops click propagation — without
 * it, tapping a row or dragging the list's scrollbar closed the only route to the full
 * ranking, which was a real bug in review.
 */
export default function LeaderboardModal({
  open, board, me, memberCount, onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const ranked = board.map((user, index) => ({ ...user, rank: index + 1 }));
  const [first, second, third] = ranked;
  const rest = ranked.slice(3);

  return (
    <div className="dash-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dash-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Leaderboard"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dash-modal-head">
          <div>
            <h2>Leaderboard</h2>
            <span className="dash-modal-sub">
              {memberCount.toLocaleString('en-US')} member{memberCount === 1 ? '' : 's'}
            </span>
          </div>
          <button type="button" className="dash-modal-close" onClick={onClose} aria-label="Close">
            <i className="fa fa-xmark" aria-hidden="true" />
          </button>
        </header>

        {/* Ordered 2nd · 1st · 3rd so the winner sits centre and tallest. */}
        <div className="dash-podium">
          <Podium user={second} place={2} size={60} />
          <Podium user={first} place={1} size={76} />
          <Podium user={third} place={3} size={60} />
        </div>

        <div className="dash-modal-list">
          {rest.length === 0 && <p className="dash-empty">No other members ranked yet.</p>}

          {rest.map((user) => (
            <div
              className={`dash-modal-row ${me.uuid && user.uuid === me.uuid ? 'is-me' : ''}`}
              key={user.uuid ?? user.rank}
            >
              <span className="dash-modal-rank">{user.rank}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dash-modal-avatar" src={user.picture || '/unknown.png'} alt="" />
              <div className="dash-modal-who">
                <span className="dash-modal-name">{user.firstName} {user.lastName}</span>
                <span className="dash-modal-level">{levelFor(user.points).name}</span>
              </div>
              <span className="dash-modal-points">
                {(user.points ?? 0).toLocaleString('en-US')}
              </span>
            </div>
          ))}
        </div>

        <footer className="dash-modal-foot">
          <span className="dash-modal-footlabel">Your rank</span>
          <span className="dash-modal-footvalue">
            {me.rank
              ? `#${me.rank} · ${(me.points ?? 0).toLocaleString('en-US')} pts`
              : 'Not ranked'}
          </span>
        </footer>
      </div>
    </div>
  );
}

LeaderboardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  board: PropTypes.arrayOf(PropTypes.object).isRequired,
  me: PropTypes.object.isRequired,
  memberCount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
