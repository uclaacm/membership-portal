const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { buildReminderEmail, buildRSVPConfirmationEmail, LOGO_CID } = require('./reminder-template');

const wordmark = fs.readFileSync(path.join(__dirname, 'assets', 'acm-wordmark.png'));

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

async function sendMail({ to, subject, text, html }) {
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
    html,
    attachments: [{
      filename: 'acm-wordmark.png',
      content: wordmark,
      cid: LOGO_CID,
      contentDisposition: 'inline',
    }],
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  if (!result.accepted?.length) throw new Error('SMTP did not accept the recipient.');
  return result;
}

async function sendEventReminder({ to, event }) {
  return sendMail({
    to,
    ...buildReminderEmail({ event }),
  });
}

async function sendRSVPConfirmation({ to, event }) {
  return sendMail({
    to,
    ...buildRSVPConfirmationEmail({ event }),
  });
}

async function sendReminderTest(to) {
  return sendMail({
    to,
    ...buildReminderEmail({
      event: {
        title: 'Sample ACM event',
        startDate: new Date(Date.now() + 60 * 60 * 1000),
        location: 'UCLA campus',
      },
      preview: true,
    }),
  });
}

module.exports = { getReminderMailConfig, sendEventReminder, sendRSVPConfirmation, sendReminderTest };
