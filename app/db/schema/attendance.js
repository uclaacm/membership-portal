const { Event, User } = require('../../db');

module.exports = (Sequelize, db) => {
  /**
   * Each attendance record in the database represents one user attending
   * one event.
   */
  const Attendance = db.define('attendance', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // uniquely identifites this attendance
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },

    // uuid of the user that attended the event
    user: {
      type: Sequelize.UUID,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'Invalid value for user UUID',
        },
        notEmpty: {
          msg: 'The user UUID is a required field',
        },
      },
    },

    // uuid of the event that the user attended
    event: {
      type: Sequelize.UUID,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'Invalid value for user UUID',
        },
        notEmpty: {
          msg: 'The user UUID is a required field',
        },
      },
    },

    // date and time of attendance (stored as UTC Datestring)
    date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    // creating indices on frequently accessed fields improves efficiency
    indexes: [
      // a hash index on the uuid makes lookup by UUID O(1)
      {
        unique: true,
        fields: ['uuid'],
      },

      // a hash index on the user makes lookup by user O(1)
      {
        unique: false,
        fields: ['user'],
      },

      // a hash index on the event makes lookup by event O(1)
      {
        unique: false,
        fields: ['event'],
      },

      // a BTREE index on the date makes retrieving attendance in chronological order O(N),
      // where N is the number of attendance records
      {
        name: 'attendance_date_btree_index',
        method: 'BTREE',
        fields: ['date', { attribute: 'date', order: 'ASC' }],
      },

      // a BTREE index on the user makes retrieving all attendance for a user O(N), where
      // N is the number of attendances for this user
      {
        name: 'attendance_user_btree_index',
        method: 'BTREE',
        fields: ['user', { attribute: 'user', order: 'ASC' }],
      },

      // a BTREE index on the event makes retrieving all attendance for a event O(N), where
      // N is the number of attendances for this event
      {
        name: 'attendance_event_btree_index',
        method: 'BTREE',
        fields: ['event', { attribute: 'event', order: 'ASC' }],
      },
    ],
  });

  Attendance.getAttendanceForUser = user => this.findAll({ where: { user }, order: [['date', 'ASC']] });

  Attendance.getAttendanceForEvent = event => this.findAll({ where: { event } });

  Attendance.getCommitteeLeaderboard = (committee, _offset, _limit) => {
    let offset = _offset;
    let limit = _limit;
    if (!offset || offset < 0) offset = 0;
    if (!limit || limit < 0) limit = undefined;
    return this.findAll({
      where: { accessType: 'STANDARD', committee },
      offset,
      limit,
      include: [{ model: User }, { model: Event }],
    });
  };

  Attendance.userAttendedEvent = (user, event) => this.count({ where: { user, event } })
    .then(c => c !== 0);

  Attendance.attendEvent = (user, event) => this.create({ user, event });

  Attendance.prototype.getPublic = () => ({
    uuid: this.getDataValue('uuid'),
    user: this.getDataValue('user'),
    event: this.getDataValue('event'),
    date: this.getDataValue('date'),
  });

  return Attendance;
};
