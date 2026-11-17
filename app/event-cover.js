/**
 * Rewrites a Google Drive share link into a directly embeddable thumbnail URL.
 *
 * A /file/d/<id>/view link is an HTML page, not an image, so rendering it in an <img> or as a
 * background produces nothing. Only /file/d/<id>/ links carry an extractable id; anything else
 * (including an already-rewritten thumbnail URL) is returned untouched.
 *
 * Lives here rather than beside the authenticated event router because the public API serves
 * the same covers to outside consumers. Two copies of this rule would drift, and the copy that
 * fell behind would be the one on the public internet.
 */
const normalizeCover = (cover) => {
  if (!cover || !cover.includes('drive.google.com')) return cover;
  const match = cover.match(/\/file\/d\/([^/?#]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=s1000` : cover;
};

module.exports = { normalizeCover };
