import moment from 'moment';
import Config from '@/lib/config';

/** "Sep 24, 2023", or an em dash when the value is missing. */
export const formatDate = (value) => (value ? moment(value).format('MMM D, YYYY') : '—');

/** "Aug 9, 14:02" — the compact stamp used by the audit log. */
export const formatTimestamp = (value) => (value ? moment(value).format('MMM D, HH:mm') : '—');

/** "2 hours ago", or an em dash. Used for last-active and activity-feed columns. */
export const formatRelative = (value) => (value ? moment(value).fromNow() : '—');

/** "184 KB" / "1.8 GB". Bytes are rounded the way a file browser would show them. */
export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/** Thousands separators for every count in the panel. */
export const formatCount = (value) => (value ?? 0).toLocaleString('en-US');

/** Maps a school year integer to the label the design uses. */
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Post-senior'];
export const formatYear = (year) => YEARS[year - 1] || '—';

/**
 * Derives an event's status pill from its dates.
 * A draft is an event with no start date — the portal has no explicit published flag.
 */
export const eventStatus = (event) => {
  if (!event.startDate) return 'Draft';
  return moment(event.startDate).isAfter(moment()) ? 'Upcoming' : 'Past';
};

/**
 * Absolute, shareable URL for an uploaded image.
 *
 * Config.API_URL is "/app" in the browser, which yields a path-only URL that is useless once
 * pasted anywhere outside the portal. Prefixing the current origin makes it work in a Sheets
 * cover column, a Discord message, or an event's cover field.
 *
 * Safe to call during render: the Control Panel renders nothing until mounted, so this never
 * runs on the server where `window` is undefined.
 */
export const imageUrl = (uuid) => {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}${Config.API_URL}${Config.routes.image.specific}/${uuid}`;
};

/** Filename shown for an uploaded image, which the API stores only by uuid and mimetype. */
export const imageFilename = (image) => {
  const extension = (image.mimetype || '').split('/')[1] || 'bin';
  return `${String(image.uuid).slice(0, 8)}.${extension}`;
};
