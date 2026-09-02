const { AUDIT_ACTIONS } = require('../../audit-actions');

module.exports = (Sequelize, db) => {
  /**
   * An AuditLog entry records a single privileged action taken in the portal.
   *
   * Unlike Activity (which tracks member-facing things like logins and event attendance and is
   * used to award points), this table exists for accountability: who changed a role, who deleted
   * an event, who rotated a secret. Entries are append-only and are never updated or deleted.
   *
   * Actor name and email are denormalized on purpose. The log has to stay readable after the
   * acting user is removed, so it cannot depend on a join to `users` surviving.
   */
  const AuditLog = db.define(
    'auditLog',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },

      // the user who performed the action
      actor: {
        type: Sequelize.UUID,
        allowNull: true,
      },

      // denormalized so the entry survives deletion of the actor
      actorName: {
        type: Sequelize.STRING,
      },

      actorEmail: {
        type: Sequelize.STRING,
      },

      // dot-namespaced action, e.g. 'role.grant'. See app/audit-actions.js.
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isKnownAction(value) {
            if (!AUDIT_ACTIONS.includes(value)) {
              throw new Error(`Unknown audit action: ${value}`);
            }
          },
        },
      },

      // what was acted on — an email, an event title, a filename, a setting name
      target: {
        type: Sequelize.STRING,
      },

      // human-readable context, e.g. 'Granted admin' or 'Cyber - 10 pts'
      detail: {
        type: Sequelize.STRING,
      },

      // committee the action was scoped to, when applicable
      committee: {
        type: Sequelize.STRING,
      },

      ip: {
        type: Sequelize.STRING,
      },
    },
    {
      // append-only: no updatedAt, and nothing in the codebase may update a row
      updatedAt: false,
      indexes: [
        { unique: true, fields: ['uuid'] },
        { name: 'audit_created_at_index', fields: ['createdAt'] },
        { name: 'audit_action_index', fields: ['action'] },
        { name: 'audit_actor_index', fields: ['actor'] },
      ],
    },
  );

  AuditLog.prototype.getPublic = function getPublic() {
    return {
      uuid: this.getDataValue('uuid'),
      actor: this.getDataValue('actor'),
      actorName: this.getDataValue('actorName'),
      actorEmail: this.getDataValue('actorEmail'),
      action: this.getDataValue('action'),
      target: this.getDataValue('target'),
      detail: this.getDataValue('detail'),
      committee: this.getDataValue('committee'),
      ip: this.getDataValue('ip'),
      createdAt: this.getDataValue('createdAt'),
    };
  };

  return AuditLog;
};
