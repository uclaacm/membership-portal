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
}, {
  tableName: 'event_reminders',
  indexes: [
    { unique: true, fields: ['rsvpId'], name: 'event_reminders_rsvp_unique' },
    { fields: ['status', 'dueAt'], name: 'event_reminders_due_index' },
  ],
});
