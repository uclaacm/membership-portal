const { randomBytes, randomUUID } = require('crypto');

const MAX_REPEATED_EVENT_INSTANCES = 50;

const normalizeDate = (value) => new Date(value);

const toDateOnlyKey = (value) => {
  const date = normalizeDate(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getISOWeekday = (date) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const getStartOfISOWeek = (date) => {
  const startOfWeek = new Date(date);
  const isoWeekday = getISOWeekday(startOfWeek);
  startOfWeek.setDate(startOfWeek.getDate() - (isoWeekday - 1));
  return startOfWeek;
};

const buildOccurrenceStart = (weekStart, isoWeekday, timeAnchor) => {
  const occurrenceStart = new Date(weekStart);
  occurrenceStart.setDate(occurrenceStart.getDate() + (isoWeekday - 1));
  occurrenceStart.setHours(
    timeAnchor.getHours(),
    timeAnchor.getMinutes(),
    timeAnchor.getSeconds(),
    timeAnchor.getMilliseconds(),
  );
  return occurrenceStart;
};

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const randomAlphanumeric4 = () => {
  const bytes = randomBytes(4);
  let out = '';
  for (let i = 0; i < 4; i += 1) {
    out += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return out;
};

/**
 * `{baseCode}-XXXX` where `XXXX` is four random alphanumeric chars.
 * Codes are unique within `usedCodes`.
 */
const buildAttendanceCode = (baseCode, usedCodes) => {
  const normalizedBase = (baseCode || 'EVENT').trim() || 'EVENT';
  const maxBaseLen = 255 - 1 - 4;
  const finalBase = normalizedBase.slice(0, Math.max(1, maxBaseLen));
  let code;
  do {
    code = `${finalBase}-${randomAlphanumeric4()}`;
  } while (usedCodes.has(code));
  usedCodes.add(code);
  return code;
};

const buildRepeatedEventRows = (templateEvent, recurrence) => {
  const eventGroupId = randomUUID();
  const seriesStartDate = normalizeDate(templateEvent.startDate);
  const seriesStartDateKey = toDateOnlyKey(seriesStartDate);
  const seriesEndDate = normalizeDate(recurrence.seriesEndDate);
  const seriesEndDateKey = toDateOnlyKey(seriesEndDate);
  const templateEndDate = normalizeDate(templateEvent.endDate);
  const durationMs = templateEndDate.getTime() - seriesStartDate.getTime();
  const intervalWeeks = Number.parseInt(recurrence.intervalWeeks, 10);
  const selectedDays = (Array.isArray(recurrence.daysOfWeek) && recurrence.daysOfWeek.length > 0)
    ? [...new Set(recurrence.daysOfWeek)].sort((a, b) => a - b)
    : [getISOWeekday(seriesStartDate)];
  const firstWeekStart = getStartOfISOWeek(seriesStartDate);

  const rows = [];
  const usedAttendanceCodes = new Set();
  const weekCursor = new Date(firstWeekStart);

  while (toDateOnlyKey(weekCursor) <= seriesEndDateKey) {
    for (let i = 0; i < selectedDays.length; i += 1) {
      const startDate = buildOccurrenceStart(weekCursor, selectedDays[i], seriesStartDate);
      const endDate = new Date(startDate.getTime() + durationMs);
      if (
        toDateOnlyKey(startDate) >= seriesStartDateKey
        && toDateOnlyKey(endDate) <= seriesEndDateKey
      ) {
        if (rows.length >= MAX_REPEATED_EVENT_INSTANCES) {
          throw new Error(`Cannot create more than ${MAX_REPEATED_EVENT_INSTANCES} repeated events`);
        }

        rows.push({
          ...templateEvent,
          startDate,
          endDate,
          eventGroupId,
          attendanceCode: buildAttendanceCode(
            templateEvent.attendanceCode,
            usedAttendanceCodes,
          ),
        });
      }
    }
    weekCursor.setDate(weekCursor.getDate() + (intervalWeeks * 7));
  }

  return { eventGroupId, rows };
};

module.exports = {
  MAX_REPEATED_EVENT_INSTANCES,
  buildRepeatedEventRows,
};
