'use client';

import PropTypes from 'prop-types';
import levelFor from './levels';

/** Progress toward the next rung of the level ladder. */
export default function ProgressCard({ points }) {
  const level = levelFor(points);

  return (
    <section className="dash-card dash-progress" style={{ order: 4 }}>
      <span className="dash-label">Your progress</span>

      <div className="dash-progress-head">
        <span className="dash-progress-name">{level.name}</span>
        <span className="dash-progress-points">
          {points.toLocaleString('en-US')} pts · Level {level.level}
        </span>
      </div>

      <div className="dash-progress-track">
        <div className="dash-progress-fill" style={{ width: `${level.percent}%` }} />
      </div>

      <p className="dash-progress-caption">
        {level.nextName
          ? `${level.toNext.toLocaleString('en-US')} points to ${level.nextName}`
          : 'Top of the ladder — nothing left to climb.'}
      </p>
    </section>
  );
}

ProgressCard.propTypes = { points: PropTypes.number };
ProgressCard.defaultProps = { points: 0 };
