module.exports = (Sequelize, db) => db.define('eventReminder', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rsvpId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'rsvps', key: 'id' },
    onDelete: 'CASCADE',
  },
  kind: {
    type: Sequelize.STRING(16),
    allowNull: false,
    // Only for legacy db-init/backfill; the latest migration drops this DB default.
    defaultValue: 'one_hour',
    validate: { isIn: [['one_week', 'three_days', 'one_day', 'day_of']] },
  },
  dueAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING(16),
    allowNull: false,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'sending', 'sent']] },
  },
  attempts: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sentAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  lastError: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  claimedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  nextAttemptAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
}, {
  tableName: 'event_reminders',
  indexes: [
    { fields: ['status', 'dueAt'], name: 'event_reminders_due_index' },
  ],
});
