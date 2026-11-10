const LOGO_CID = 'acm-wordmark@portal.uclaacm.com';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function formatEventTime(startDate) {
  return new Date(startDate).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  });
}

function eventsUrl(portalUrl) {
  const fallback = 'https://portal.uclaacm.com/events';
  try {
    const base = new URL(portalUrl || fallback);
    if (!['http:', 'https:'].includes(base.protocol)) return fallback;
    return new URL('/events', base).toString();
  } catch (_) {
    return fallback;
  }
}

function buildEventEmail({ event, portalUrl, kind }) {
  const preview = kind === 'test';
  const confirmation = kind === 'confirmation';
  const title = String(event.title || 'ACM event').replace(/[\r\n]+/g, ' ').trim();
  const when = `${formatEventTime(event.startDate)} (Los Angeles time)`;
  const where = String(event.location || 'See event details');
  const url = eventsUrl(portalUrl);
  const safeTitle = escapeHtml(title);
  const safeWhen = escapeHtml(when);
  const safeWhere = escapeHtml(where);
  const safeUrl = escapeHtml(url);
  const heading = preview ? 'Your reminder preview'
    : (confirmation ? "You're on the list." : 'See you in an hour.');
  const intro = preview
    ? 'This is a test email. Here is what members will see before an event.'
    : (confirmation
      ? 'Your RSVP is confirmed. Keep these event details handy.'
      : 'The event you RSVPed to is coming up soon. Here are the details.');
  const footer = preview
    ? 'This is a test message. No event RSVP was created.'
    : (confirmation
      ? 'You received this confirmation because you RSVPed to this event.'
      : 'You received this because you opted in to email reminders when you RSVPed.');
  const preheader = preview ? 'A preview of your ACM event reminders.'
    : (confirmation ? `Your RSVP for ${safeTitle} is confirmed.` : `${safeTitle} starts in one hour.`);
  const label = preview ? 'TEST EMAIL' : (confirmation ? 'RSVP CONFIRMED' : 'EVENT REMINDER');
  const cardLabel = confirmation ? 'YOUR EVENT' : 'COMING UP';

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safeTitle}</title></head>
<body style="margin:0;padding:0;background:#f2f6ff;font-family:Arial,Helvetica,sans-serif;color:#152543;">
  <div style="display:none;font-size:1px;line-height:1px;color:#f2f6ff;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f2f6ff;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dce5f5;border-radius:12px;">
        <tr><td style="padding:24px 32px 20px;">
          <img src="cid:${LOGO_CID}" width="139" height="54" alt="ACM at UCLA" style="display:block;width:139px;height:54px;border:0;">
        </td></tr>
        <tr><td height="5" bgcolor="#1e6cff" style="height:5px;background:#1e6cff;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr><td style="padding:34px 32px 12px;">
          <p style="margin:0 0 12px;color:#1e6cff;font-size:12px;font-weight:700;letter-spacing:1.5px;">${label}</p>
          <h1 style="margin:0 0 12px;font-size:30px;line-height:1.2;color:#152543;">${heading}</h1>
          <p style="margin:0;color:#52627c;font-size:16px;line-height:1.5;">${intro}</p>
        </td></tr>
        <tr><td style="padding:16px 32px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f7ff;border:1px solid #e2eaff;border-radius:8px;">
            <tr><td style="padding:22px 24px;">
              <p style="margin:0 0 14px;color:#1e6cff;font-size:12px;font-weight:700;letter-spacing:1.2px;">${cardLabel}</p>
              <h2 style="margin:0 0 20px;color:#152543;font-size:23px;line-height:1.3;">${safeTitle}</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td width="72" valign="top" style="padding:0 12px 12px 0;color:#65748d;font-size:12px;font-weight:700;letter-spacing:1px;">WHEN</td><td valign="top" style="padding:0 0 12px;color:#152543;font-size:15px;line-height:1.4;">${safeWhen}</td></tr>
                <tr><td width="72" valign="top" style="padding:0 12px 0 0;color:#65748d;font-size:12px;font-weight:700;letter-spacing:1px;">WHERE</td><td valign="top" style="color:#152543;font-size:15px;line-height:1.4;">${safeWhere}</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px 34px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#1e6cff" style="background:#1e6cff;border-radius:6px;">
            <a href="${safeUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">View events</a>
          </td></tr></table>
          <p style="margin:16px 0 0;color:#65748d;font-size:12px;line-height:1.4;">If the button does not work, visit <a href="${safeUrl}" style="color:#1e6cff;">${safeUrl}</a>.</p>
        </td></tr>
      </table>
      <p style="max-width:600px;margin:20px 0 0;color:#65748d;font-size:12px;line-height:1.5;">${footer}<br>ACM at UCLA</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `ACM AT UCLA — ${label}`,
    '',
    preview ? 'This is a preview. No event RSVP was created.'
      : (confirmation ? `Your RSVP for ${title} is confirmed.` : `${title} starts in one hour.`),
    '',
    title,
    `When: ${when}`,
    `Where: ${where}`,
    `View events: ${url}`,
    '',
    footer,
    'ACM at UCLA',
  ].join('\n');

  return {
    subject: preview ? 'Test: ACM event reminder'
      : (confirmation ? `RSVP confirmed: ${title}` : `Reminder: ${title} starts in one hour`),
    html,
    text,
  };
}

function buildReminderEmail({ event, portalUrl, preview = false }) {
  return buildEventEmail({ event, portalUrl, kind: preview ? 'test' : 'reminder' });
}

function buildRSVPConfirmationEmail({ event, portalUrl }) {
  return buildEventEmail({ event, portalUrl, kind: 'confirmation' });
}

module.exports = { buildReminderEmail, buildRSVPConfirmationEmail, LOGO_CID };
