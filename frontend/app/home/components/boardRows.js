/**
 * Builds the rows the leaderboard rail should render, given how many fit.
 *
 * When the current user's rank falls outside the visible window, the card shows the top N-2,
 * an ellipsis row, then the user pinned last — so someone ranked #340 still sees their standing
 * without a scroller. When they are already inside the window, no ellipsis appears.
 *
 * Kept free of JSX and React so the pinning rule — the fiddly part of this card — is plain,
 * testable logic rather than something only reachable by rendering a component.
 *
 * @param {object[]} board ordered leaderboard page, highest points first
 * @param {number}   count how many rows fit
 * @param {object}   me    {uuid, rank, points}; rank is null when unranked
 * @returns {object[]} rows, each either a user row or `{ ellipsis: true }`
 */
export default function buildRows(board, count, me) {
  if (count <= 0) return [];

  const withRank = board.map((user, index) => ({ ...user, rank: index + 1 }));
  const visible = withRank.slice(0, count);

  // Unranked callers (officers and admins are not on the board) get the plain top-N.
  if (!me || !me.rank) return visible;

  const isMe = (user) => me.uuid && user.uuid === me.uuid;
  if (visible.some(isMe)) return visible;

  // Pinning costs two slots: the ellipsis and the user's own row. Below three rows there is
  // no room for both, so the user's standing wins — that is the point of the card.
  if (count < 3) return [{ ...me, pinned: true }];

  return [
    ...withRank.slice(0, count - 2),
    { ellipsis: true },
    { ...me, pinned: true },
  ];
}
