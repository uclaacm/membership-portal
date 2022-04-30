const _ = require("underscore");

module.exports = (Sequelize, db) => {
  const Event = db.define(
    "event",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // event UUID: uniquely identifies an event
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },

      // currently unused, but the organization that the event is for
      organization: {
        type: Sequelize.STRING,
        defaultValue: "ACM",
        validate: {
          len: {
            args: [2, 255],
            msg: "The organization name must be between 2 and 255 characters long",
          },
        },
      },

      // committee that is hosting the event (empty signifies general event)
      committee: {
        type: Sequelize.STRING,
        defaultValue: "ACM",
      },

    // currently unused, but a thumbnail image (square-ish) URL
    thumb: {
      type: Sequelize.STRING,
      validate: {
        len: {
          args: [3, 2048],
          msg: 'If specified, the thumbnail URL must be between 3 and 2048 characters long',
        },
      },

    // URL for a (rectangular, larger) cover image
    cover: {
      type: Sequelize.STRING,
      validate: {
        len: {
          args: [3, 2048],
          msg: 'The cover image URL must be between 3 and 2048 characters long',
        },
      },

      // event title
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 255],
            msg: "The title must be between 3 and 255 characters long",
          },
          notEmpty: {
            msg: "The title field is required",
          },
        },
      },

      // event description
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "The description field is required",
          },
        },
      },

      // physical location of the event
      location: {
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [3, 255],
            msg: "The location must be between 3 and 255 characters long",
          },
        },
      },

    // link to a FB event, evite, etc. (currently required)
    eventLink: {
      type: Sequelize.STRING,
      validate: {
        len: {
          args: [3, 2048],
          msg: 'The event link must be between 3 and 2048 characters long',
        },
      },

      // event start date and time (stored as UTC Datestring)
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "The start date must be a date",
          },
          notEmpty: {
            msg: "The start date is a required field",
          },
        },
      },

      // event end date and time (stored as UTC Datestring)
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "The end date must be a date",
          },
          notEmpty: {
            msg: "The end date is a required field",
          },
        },
      },

      // attendance code for the event (should be unique across all events)
      attendanceCode: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: {
            args: [3, 255],
            msg: "The attendance code must be between 3 and 255 characters long",
          },
        },
      },

      // amount of points attending this event is worth
      attendancePoints: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "The attendance points must be at least 0",
          },
        },
      },

      // starting in winter 2019, we want to soft-delete events by marking them as 'deleted'
      // and then not serving them to the user, vs. deleting them from the database entirely.
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      // creating indices on frequently accessed fields improves efficiency
      indexes: [
        // a hash index on the uuid makes lookup by UUID O(1)
        {
          unique: true,
          fields: ["uuid"],
        },

        // a BTREE index on the start date makes retrieving all events in chronological order O(N)
        {
          name: "event_start_date_index",
          method: "BTREE",
          fields: ["startDate", { attribute: "startDate", order: "DESC" }],
        },

        // a BTREE index on the end date makes retrieving all events in chronological order O(N)
        {
          name: "event_end_date_index",
          method: "BTREE",
          fields: ["endDate", { attribute: "endDate", order: "DESC" }],
        },
        {
          name: "committee_index",
          method: "BTREE",
          fields: ["committee"],
        },
      ],
    }
  );

  Event.getAll = function (offset, limit) {
    if (!offset || offset < 0) offset = 0;
    if (!limit || limit < 0) limit = undefined;
    return this.findAll({ offset, limit, order: [["startDate", "ASC"]] });
  };

  Event.findByUUID = function (uuid) {
    return this.findOne({ where: { uuid } });
  };

  Event.findByAttendanceCode = function (attendanceCode) {
    return this.findOne({ where: { attendanceCode } });
  };

  Event.eventExists = function (uuid) {
    return this.count({ where: { uuid } }).then((c) => c !== 0);
  };

  Event.destroyByUUID = function (uuid) {
    return this.destroy({ where: { uuid } });
  };

  Event.getCommitteeEvents = function (committee, offset, limit) {
    if (!offset || offset < 0) offset = 0;
    if (!limit || limit < 0) limit = undefined;
    return this.findAll({ where: { committee }, offset, limit });
  };

  Event.getPastEvents = function (offset, limit) {
    if (!offset || offset < 0) offset = 0;
    if (!limit || limit < 0) limit = undefined;
    const now = new Date();
    return this.findAll({
      where: { startDate: { $lt: now } },
      order: [["startDate", "ASC"]],
      offset,
      limit,
    });
  };

  Event.getFutureEvents = function (offset, limit) {
    if (!offset || offset < 0) offset = 0;
    if (!limit || limit < 0) limit = undefined;
    const now = new Date();
    return this.findAll({
      where: { startDate: { $gte: now } },
      order: [["startDate", "ASC"]],
      offset,
      limit,
    });
  };

  Event.sanitize = function (event) {
    event = _.pick(event, [
      "committee",
      "cover",
      "thumb",
      "title",
      "description",
      "location",
      "eventLink",
      "startDate",
      "endDate",
      "attendanceCode",
      "attendancePoints",
    ]);
    if (event.committee !== undefined && event.committee.length === 0)
      delete event.committee;
    if (
      event.attendanceCode !== undefined &&
      event.attendanceCode.length === 0
    ) {
      delete event.attendanceCode;
    }

    if (event.attendancePoints !== undefined) {
      const points = parseInt(event.attendancePoints, 10);
      if (points === NaN || points < 0) delete event.attendancePoints;
    }

    return event;
  };

  Event.prototype.getPublic = function (admin) {
    return {
      uuid: this.getDataValue("uuid"),
      organization: this.getDataValue("organization"),
      committee: this.getDataValue("committee"),
      cover: this.getDataValue("cover"),
      title: this.getDataValue("title"),
      description: this.getDataValue("description"),
      location: this.getDataValue("location"),
      eventLink: this.getDataValue("eventLink"),
      startDate: this.getDataValue("startDate"),
      endDate: this.getDataValue("endDate"),
      attendanceCode: admin ? this.getDataValue("attendanceCode") : undefined,
      attendancePoints: this.getDataValue("attendancePoints"),
    };
  };

  return Event;
};
