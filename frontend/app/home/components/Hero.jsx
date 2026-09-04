'use client';

import PropTypes from 'prop-types';
import NeuralBackground from './NeuralBackground';

/**
 * Dashboard hero.
 *
 * Rebalanced from the old version, where a 200px avatar and a 2.8rem name made the member's
 * own name the largest thing on their dashboard. The greeting leads now; the avatar is 88px.
 *
 * The NeuralBackground canvas is reused unchanged and sits behind the content at z-index 0.
 */
export default function Hero({
  firstName, picture, subline, position, rank,
}) {
  const meta = [position, rank ? `Rank #${rank}` : null].filter(Boolean).join(' · ');

  return (
    <section className="dash-hero" style={{ order: 1 }}>
      <NeuralBackground className="dash-hero-canvas" />

      <div className="dash-hero-content">
        <div className="dash-hero-left">
          {/* The greeting block is one group. Left as siblings of the credit they all became
              space-between children and spread across the hero's full height. */}
          <div className="dash-hero-greeting">
            <span className="dash-hero-eyebrow">ACM chapter at UCLA</span>
            <h1 className="dash-hero-title">Welcome back, {firstName}</h1>
            <p className="dash-hero-subline">{subline}</p>
          </div>

          <span className="dash-hero-credit">
            Brought to you by
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/acm-dev-badge.png" alt="ACM Dev Team" />
          </span>
        </div>

        <div className="dash-hero-right">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dash-hero-avatar" src={picture || '/unknown.png'} alt="" />
          <div className="dash-hero-who">
            <span className="dash-hero-name">{firstName}</span>
            {meta && <span className="dash-hero-meta">{meta}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

Hero.propTypes = {
  firstName: PropTypes.string.isRequired,
  picture: PropTypes.string,
  subline: PropTypes.string.isRequired,
  position: PropTypes.string,
  rank: PropTypes.number,
};

Hero.defaultProps = { picture: '', position: '', rank: null };
