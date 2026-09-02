/**
 * Every action the audit log can record, and how the Control Panel groups them for filtering.
 *
 * Adding an action here is deliberate: the schema validates against this list so a typo in a
 * call site fails loudly at write time instead of silently creating an unfilterable category.
 */
const AUDIT_ACTION_GROUPS = {
  role: ['role.grant', 'role.revoke'],
  event: ['event.create', 'event.update', 'event.delete', 'events.sync'],
  media: ['media.upload', 'media.delete'],
  settings: ['settings.update'],
  internship: ['committee.open', 'committee.close', 'committee.create', 'committee.update'],
};

const AUDIT_ACTIONS = Object.values(AUDIT_ACTION_GROUPS).flat();

/**
 * Protected actions are available to admins on an as-needed basis and are ALWAYS audited.
 * Per the permission matrix, only a super admin may perform them without restriction.
 */
const PROTECTED_ACTIONS = ['role.grant', 'role.revoke', 'settings.update'];

module.exports = { AUDIT_ACTIONS, AUDIT_ACTION_GROUPS, PROTECTED_ACTIONS };
