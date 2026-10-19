'use client';

import PropTypes from 'prop-types';
import buildRows from './boardRows';

export default function LeaderboardRail({
  listRef, board, count, me, onViewAll,
}) {
  const rows = buildRows(board, count, me);

  return (
    <section className="dash-card dash-board" style={{ order: 5 }}>
      <div className="dash-board-head">
        <span className="dash-label">Leaderboard</span>
        {/* A button, not a link — the page this used to point at is gone. */}
        <button type="button" className="dash-viewall" onClick={onViewAll}>View all</button>
      </div>

      <div className="dash-board-list" ref={listRef}>
        {rows.length === 0 && <p className="dash-empty">No rankings yet.</p>}

        {rows.map((row) => {
          if (row.ellipsis) {
            return <div className="dash-board-row is-ellipsis" key="ellipsis">···</div>;
          }

          const mine = me.uuid && row.uuid === me.uuid;
          return (
            <div className={`dash-board-row ${mine ? 'is-me' : ''}`} key={row.uuid ?? row.rank}>
              <span className={`dash-board-rank ${row.rank <= 3 ? 'is-top' : ''}`}>{row.rank}</span>
              <span className="dash-board-name">
                {row.firstName ? `${row.firstName} ${row.lastName ?? ''}`.trim() : 'You'}
              </span>
              <span className="dash-board-points">{(row.points ?? 0).toLocaleString('en-US')}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

LeaderboardRail.propTypes = {
  listRef: PropTypes.object.isRequired,
  board: PropTypes.arrayOf(PropTypes.object).isRequired,
  count: PropTypes.number.isRequired,
  me: PropTypes.object.isRequired,
  onViewAll: PropTypes.func.isRequired,
};
