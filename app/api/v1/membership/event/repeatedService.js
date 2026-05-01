const { randomUUID } = require('crypto');

const MAX_REPEATED_EVENT_INSTANCES = 50;

const normalizeDate = (value) => new Date(value);

const addMonthsClamped = (date, monthsToAdd, anchorDay) => {
  const next = new Date(date);
  const targetMonth = next.getMonth() + monthsToAdd;
  const targetYear = next.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDayOfMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const day = Math.min(anchorDay, lastDayOfMonth);
  next.setFullYear(targetYear, normalizedMonth, day);
  return next;
};

const getNextStartDate = (startDate, frequency, anchorDay) => {
  if (frequency === 'daily') {
    const next = new Date(startDate);
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (frequency === 'weekly') {
    const next = new Date(startDate);
    next.setDate(next.getDate() + 7);
    return next;
  }

  return addMonthsClamped(startDate, 1, anchorDay);
};

const buildAttendanceCode = (baseCode, eventGroupId, startDate, index) => {
  const compactDate = startDate.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = `${compactDate}-${index}-${eventGroupId.slice(0, 6)}`;
  const normalizedBase = (baseCode || 'EVENT').trim() || 'EVENT';
  const maxBaseLength = 255 - suffix.length - 1;
  const finalBase = normalizedBase.slice(0, Math.max(1, maxBaseLength));
  return `${finalBase}-${suffix}`;
};

const buildRepeatedEventRows = (templateEvent, recurrence) => {
  const eventGroupId = randomUUID();
  const seriesEndDate = normalizeDate(recurrence.seriesEndDate);
  const firstStartDate = normalizeDate(templateEvent.startDate);
  const firstEndDate = normalizeDate(templateEvent.endDate);
  const durationMs = firstEndDate.getTime() - firstStartDate.getTime();
  const anchorDay = firstStartDate.getDate();

  const rows = [];
  let nextStartDate = firstStartDate;
  let index = 0;

  while (nextStartDate <= seriesEndDate) {
    if (rows.length >= MAX_REPEATED_EVENT_INSTANCES) {
      throw new Error(`Cannot create more than ${MAX_REPEATED_EVENT_INSTANCES} repeated events`);
    }

    const startDate = new Date(nextStartDate);
    const endDate = new Date(startDate.getTime() + durationMs);
    rows.push({
      ...templateEvent,
      startDate,
      endDate,
      eventGroupId,
      attendanceCode: buildAttendanceCode(
        templateEvent.attendanceCode,
        eventGroupId,
        startDate,
        index,
      ),
    });

    index += 1;
    nextStartDate = getNextStartDate(nextStartDate, recurrence.frequency, anchorDay);
  }

  return { eventGroupId, rows };
};

module.exports = {
  MAX_REPEATED_EVENT_INSTANCES,
  buildRepeatedEventRows,
};
