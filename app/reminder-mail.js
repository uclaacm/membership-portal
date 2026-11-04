const nodemailer = require('nodemailer');

function getReminderMailConfig() {
  const host = process.env.REMINDER_SMTP_HOST?.trim() || null;
  const port = Number(process.env.REMINDER_SMTP_PORT || 587);
  const username = process.env.REMINDER_SMTP_USER?.trim() || null;
  const password = process.env.REMINDER_SMTP_PASSWORD || null;
  const from = process.env.REMINDER_SMTP_FROM?.trim() || null;
  const validPort = Number.isInteger(port) && port > 0 && port < 65536;
  return {
    host,
    port: validPort ? port : null,
    username,
    from,
    configured: Boolean(host && validPort && username && password && from),
  };
}

async function sendMail({ to, subject, text }) {
  const config = getReminderMailConfig();
  if (!config.configured) throw new Error('Reminder SMTP is not configured.');

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port !== 465,
    auth: { user: config.username, pass: process.env.REMINDER_SMTP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  const result = await transport.sendMail({
    from: config.from,
    to,
    subject,
    text,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  if (!result.accepted?.length) throw new Error('SMTP did not accept the recipient.');
  return result;
}

function formatEventTime(startDate) {
  return new Date(startDate).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  });
}

async function sendEventReminder({ to, event }) {
  const portalUrl = process.env.PORTAL_URL || 'https://portal.uclaacm.com';
  return sendMail({
    to,
    subject: `Reminder: ${event.title} starts in one hour`,
    text: [
      `${event.title} starts in one hour.`,
      `When: ${formatEventTime(event.startDate)} (Los Angeles time)`,
      `Where: ${event.location || 'See event details'}`,
      `Event details: ${portalUrl}/events`,
    ].join('\n'),
  });
}

async function sendReminderTest(to) {
  return sendMail({
    to,
    subject: 'ACM event reminder email test',
    text: 'This is a test of the ACM Membership Portal event reminder email transport.',
  });
}

module.exports = { getReminderMailConfig, sendEventReminder, sendReminderTest };
