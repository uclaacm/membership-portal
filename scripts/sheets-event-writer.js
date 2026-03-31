const { google } = require('googleapis');
const Config = require('../app/config');

// .env config
const SERVICE_ACCOUNT = Config.sheets.serviceAcct;
const SPREADSHEET_ID = Config.sheets.eventsSheetId;

/**
 * Read data from Google Sheets using the Google Sheets API.
 * @param {string} range - sheet range (e.g., 'Week 1!A:I')
 * @returns {Array} - array of rows
 */
async function getGoogleSheetData(range) {
  const sheets = google.sheets({ version: 'v4' });

  // Get JWT Token to access sheet.
  const serviceAccount = JSON.parse(SERVICE_ACCOUNT);
  // Fix escaped newlines in private key.
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  await jwtClient.authorize();

  // Get data from Google spreadsheets.
  const res = await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  const rows = res && res.data && res.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows;
}

/**
 * Parse date and time strings into a Date object
 * @param {string} dateStr - date string (e.g., "2024-01-15" or "1/15/2024")
 * @param {string} timeStr - time string (e.g., "6:00 PM" or "18:00")
 * @returns {Date} - parsed date object
 */
function parseDateTime(dateStr, timeStr) {
  try {
    // Parse date - support various formats.
    let dateParts;
    if (dateStr.includes('-')) {
      // ISO format: 2024-01-15.
      dateParts = dateStr.split('-').map((p) => parseInt(p, 10));
      // Assuming YYYY-MM-DD.
      if (dateParts[0] > 1000) {
        // Year is first. Convert to MM, DD, YYYY.
        dateParts = [dateParts[1], dateParts[2], dateParts[0]];
      }
    } else if (dateStr.includes('/')) {
      // US format: 1/15/2024 or 01/15/2024.
      dateParts = dateStr.split('/').map((p) => parseInt(p, 10));
      // Assuming MM/DD/YYYY.
    } else {
      throw new Error(`Unsupported date format: ${dateStr}`);
    }

    const [month, day, year] = dateParts;

    // Parse time - support 12-hour and 24-hour formats.
    let hours;
    let minutes;
    const timeLower = timeStr.toLowerCase().trim();

    if (timeLower.includes('am') || timeLower.includes('pm')) {
      // 12-hour format.
      const isPM = timeLower.includes('pm');
      const timeOnly = timeLower.replace(/am|pm/g, '').trim();
      const [h, m] = timeOnly.split(':').map((p) => parseInt(p, 10));

      hours = h;
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      minutes = m || 0;
    } else {
      // 24-hour format.
      const [h, m] = timeStr.split(':').map((p) => parseInt(p, 10));
      hours = h;
      minutes = m || 0;
    }

    // Create Date object (in local timezone, will be converted to UTC by Sequelize).
    const date = new Date(year, month - 1, day, hours, minutes, 0);

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr} ${timeStr}`);
    }

    return date;
  } catch (err) {
    return null;
  }
}

/**
 * Generate a unique attendance code from title and date
 * @param {string} title - event title
 * @param {string} dateStr - date string
 * @returns {string} - attendance code
 */
function generateAttendanceCode(title, dateStr) {
  // Create code from title acronym + date.
  const words = title.toUpperCase().split(/\s+/);
  const acronym = words
    .map((w) => w[0])
    .filter((c) => /[A-Z0-9]/.test(c))
    .join('')
    .substring(0, 5);

  // Add date component.
  const dateComponent = dateStr.replace(/[^0-9]/g, '').substring(0, 6);

  return `${acronym}${dateComponent}`;
}

/**
 * Read events from a specific week sheet.
 * @param {number} weekNumber - week number (1-10)
 * @returns {Array} - array of event objects
 */
async function getEventsFromWeek(weekNumber) {
  const range = `Week ${weekNumber}!A:I`;
  const rows = await getGoogleSheetData(range);

  const events = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Skip header rows and example events.
    if (
      row.length < 5
      || row[0] === 'Committee'
      || (row[0] && row[0].includes('Example:'))
      || !row[1] // Skip if no title.
      || !row[2] // Skip if no date.
      || !row[3] // Skip if no start time.
      || !row[4] // Skip if no end time.
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // Parse the event data.
    // Columns: Committee, Title, Date, Start Time, End Time, Location,
    // Description, FB Link, Image.
    const committee = (row[0] && row[0].trim()) || 'ACM';
    const title = row[1] && row[1].trim();
    const dateStr = row[2] && row[2].trim();
    const startTime = row[3] && row[3].trim();
    const endTime = row[4] && row[4].trim();
    const location = (row[5] && row[5].trim()) || '';
    const description = (row[6] && row[6].trim()) || 'No description provided';
    const eventLink = (row[7] && row[7].trim()) || '';
    const cover = (row[8] && row[8].trim()) || '';

    // Parse start and end dates.
    const startDate = parseDateTime(dateStr, startTime);
    const endDate = parseDateTime(dateStr, endTime);

    if (!startDate || !endDate) {
      throw new Error(`Invalid date/time format for event "${title}"`);
    }

    // Generate attendance code from title and date.
    const attendanceCode = generateAttendanceCode(title, dateStr);

    // Default attendance points.
    const attendancePoints = 10;

    const eventObj = {
      committee,
      title,
      description,
      location: location || undefined,
      eventLink: eventLink || undefined,
      cover: cover || undefined,
      startDate,
      endDate,
      attendanceCode,
      attendancePoints,
    };

    events.push(eventObj);
  }

  return events;
}

/**
 * Sync events from Google Sheets to the database.
 * Reads from Week 1-10 sheets and creates/updates events.
 * @param {Object} Event - sequelize Event model
 * @returns {Object} - { success: boolean, created: number, updated: number, errors: array }
 */
async function syncEventsFromSheets(Event) {
  const results = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Read all events from Week 1-10 sheets.
    const allEvents = [];

    // eslint-disable-next-line no-await-in-loop
    for (let week = 1; week <= 10; week++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const weekEvents = await getEventsFromWeek(week);
        allEvents.push(...weekEvents);
      } catch (err) {
        results.errors.push(`Error reading Week ${week}: ${err.message}`);
      }
    }

    // Create or update each event in the database (sequential for data integrity).
    // eslint-disable-next-line no-restricted-syntax
    for (const eventData of allEvents) {
      try {
        // Check if event already exists by attendance code.
        // eslint-disable-next-line no-await-in-loop
        const existing = await Event.findByAttendanceCode(eventData.attendanceCode);

        if (existing) {
          // Update existing event.
          // eslint-disable-next-line no-await-in-loop
          await existing.update(eventData);
          results.updated++;
        } else {
          // Create new event.
          // eslint-disable-next-line no-await-in-loop
          await Event.create(eventData);
          results.created++;
        }
      } catch (err) {
        results.errors.push(`Error syncing "${eventData.title}": ${err.message}`);
      }
    }

    if (results.errors.length > 0) {
      results.success = false;
    }
  } catch (err) {
    results.success = false;
    results.errors.push(`Fatal error: ${err.message}`);
  }

  return results;
}

module.exports = syncEventsFromSheets;
