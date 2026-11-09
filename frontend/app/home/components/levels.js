import Config from '@/lib/config';

/**
 * Resolves a point total against the existing level ladder in lib/config.ts.
 *
 * Mirrors the logic the old points component used, extracted so both the progress card and the
 * leaderboard rows can name a level without duplicating the walk.
 *
 * @returns {{
 *   level: number, name: string, points: number,
 *   nextName: string|null, toNext: number, percent: number
 * }}
 */
export default function levelFor(points = 0) {
  const ladder = Config.levels;

  let i = 1;
  while (i < ladder.length && points > ladder[i].startsAt) i += 1;

  const current = ladder[i - 1];
  const next = i === ladder.length ? null : ladder[i];

  // At the top of the ladder there is nothing left to fill, so the bar reads full rather than
  // dividing by a zero-width band.
  const span = next ? next.startsAt - current.startsAt : 0;
  const gained = points - current.startsAt;
  const percent = next
    ? Math.max(0, Math.min(100, span > 0 ? (gained / span) * 100 : 100))
    : 100;

  return {
    level: i,
    name: current.rank,
    points,
    nextName: next ? next.rank : null,
    toNext: next ? Math.max(0, next.startsAt - points) : 0,
    percent,
  };
}
