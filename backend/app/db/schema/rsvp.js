module.exports = (Sequelize, db) => {
  /**
   * Each RSVP record in the database represents one user RSVPing
   * to one event.
   */
  const RSVP = db.define(
    'rsvp',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // uniquely identifies this RSVP
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },

      // uuid of the user that RSVPed to the event
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

      // uuid of the event that the user RSVPed to
      event: {
        type: Sequelize.UUID,
        allowNull: false,
        validate: {
          isUUID: {
            args: 4,
            msg: 'Invalid value for event UUID',
          },
          notEmpty: {
            msg: 'The event UUID is a required field',
          },
        },
      },

      // date and time of RSVP (stored as UTC Datestring)
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
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

        // a compound unique index on user and event to ensure a user can only RSVP once per event
        {
          unique: true,
          fields: ['user', 'event'],
          name: 'rsvp_user_event_unique_index',
        },

        // a BTREE index on the date makes retrieving RSVPs in chronological order O(N),
        // where N is the number of RSVP records
        {
          name: 'rsvp_date_btree_index',
          method: 'BTREE',
          fields: ['date', { attribute: 'date', order: 'ASC' }],
        },
      ],
    },
  );

  RSVP.getRSVPsForUser = function getRSVPsForUser(user) {
    return this.findAll({ where: { user }, order: [['date', 'ASC']] });
  };

  RSVP.getRSVPsForEvent = function getRSVPsForEvent(event) {
    return this.findAll({ where: { event } });
  };

  RSVP.userRSVPedEvent = function userRSVPedEvent(user, event) {
    return this.count({ where: { user, event } }).then((c) => c !== 0);
  };

  RSVP.rsvpToEvent = function rsvpToEvent(user, event) {
    return this.create({ user, event });
  };

  RSVP.cancelRSVP = function cancelRSVP(user, event) {
    return this.destroy({ where: { user, event } });
  };

  RSVP.prototype.getPublic = function getPublic() {
    return {
      uuid: this.getDataValue('uuid'),
      user: this.getDataValue('user'),
      event: this.getDataValue('event'),
      date: this.getDataValue('date'),
    };
  };

  return RSVP;
};
