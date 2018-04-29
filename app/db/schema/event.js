const _ = require('underscore');

module.exports = (Sequelize, db) => {
	const Event = db.define('event', {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},

		// event UUID: uniquely identifies an event
		uuid: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4
		},

		// currently unused, but the organization that the event is for
		organization: {
			type: Sequelize.STRING,
			defaultValue: "ACM",
			validate: {
				len: {
					args: [2, 255],
					msg: "The organization name must be at least 2 characters long"
				}
			}
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
					args: [3, 255],
					msg: "If specified, the thumbnail URL must be at least 3 characters long"
				}
			}
		},

		// URL for a (rectangular, larger) cover image
		cover: {
			type: Sequelize.STRING,
			validate: {
				len: {
					args: [3, 255],
					msg: "The cover image URL must be at least 3 characters long"
				}
			}
		},

		// event title
		title: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				len: {
					args: [3, 255],
					msg: "The title must be at least 3 characters long"
				},
				notEmpty: {
					msg: "The title field is required"
				}
			}
		},

		// event description
		description: {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "The description field is required"
				}
			}
		},

		// physical location of the event
		location: {
			type: Sequelize.STRING,
			validate: {
				len: {
					args: [3, 255],
					msg: "The location must be at least 3 characters long"
				}
			}
		},

		// link to a FB event, evite, etc. (currently required)
		eventLink: {
			type: Sequelize.STRING,
			validate: {
				len: {
					args: [3, 255],
					msg: "The event link must be at least 3 characters long"
				}
			}
		},

		// event start date and time (stored as UTC Datestring)
		startDate: {
			type: Sequelize.DATE,
			allowNull: false,
			validate: {
				isDate: {
					msg: "The start date must be a date"
				},
				notEmpty: {
					msg: "The start date is a required field"
				}
			}
		},

		// event end date and time (stored as UTC Datestring)
		endDate: {
			type: Sequelize.DATE,
			allowNull: false,
			validate: {
				isDate: {
					msg: "The end date must be a date"
				},
				notEmpty: {
					msg: "The end date is a required field"
				}
			}
		},

		// attendance code for the event (should be unique across all events)
		attendanceCode: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false,
			validate: {
				len: {
					args: [3, 255],
					msg: "The attendance code must be at least 3 characters long"
				}
			}
		},

		// amount of points attending this event is worth
		attendancePoints: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "The attendance points must be at least 0"
				}
			}
		}
	}, {
		// creating indices on frequently accessed fields improves efficiency
		indexes: [
			// a hash index on the uuid makes lookup by UUID O(1)
			{
				unique: true,
				fields: ['uuid']
			},

			// a BTREE index on the start date makes retrieving all events in chronological order O(N)
			{
				name: 'event_start_date_index',
				method: 'BTREE',
				fields: ['startDate', { attribute: 'startDate', order: 'DESC' }]
			},

			// a BTREE index on the end date makes retrieving all events in chronological order O(N)
			{
				name: 'event_end_date_index',
				method: 'BTREE',
				fields: ['endDate', { attribute: 'endDate', order: 'DESC' }]
			}
		]
	});

	Event.getAll = function(offset, limit) {
		if (!offset || offset < 0) offset = 0;
		if (!limit || limit < 0)  limit = undefined;
		return this.findAll({ offset, limit, order: [['startDate', 'ASC']] });
	};

	Event.findByUUID = function(uuid) {
		return this.findOne({ where: { uuid } });
	};

	Event.findByAttendanceCode = function(attendanceCode) {
		return this.findOne({ where: { attendanceCode } });
	};

	Event.eventExists = function(uuid) {
		return this.count({ where: { uuid } }).then(c => c !== 0);
	};

	Event.destroyByUUID = function(uuid) {
		return this.destroy({ where: { uuid } });
	};

	Event.getPastEvents = function(offset, limit) {
		if (!offset || offset < 0) offset = 0;
		if (!limit || limit < 0)  limit = undefined;
		let now = new Date();
		return this.findAll({ where: { startDate : { $lt : now } }, order: [['startDate', 'ASC']], offset, limit });
	};

	Event.getFutureEvents = function(offset, limit) {
		if (!offset || offset < 0) offset = 0;
		if (!limit || limit < 0)  limit = undefined;
		let now = new Date();
		return this.findAll({ where: { startDate : { $gte : now } }, order: [['startDate', 'ASC']], offset, limit });
	};

	Event.getByTimeFrame = function(start, end) {
		if (!start || start < 0) start = new Date(0);
		if (!end || end < 0) end = new Date();
		return this.findAll({ where: { }});
	}

	Event.sanitize = function(event) {
		event = _.pick(event, ['committee', 'cover', 'thumb', 'title', 'description', 'location', 'eventLink', 'startDate', 'endDate', 'attendanceCode', 'attendancePoints']);
		if (event.committee !== undefined && event.committee.length === 0)
			delete event.committee;
		if (event.attendanceCode !== undefined && event.attendanceCode.length === 0)
			delete event.attendanceCode;

		if (event.attendancePoints !== undefined) {
			let points = parseInt(event.attendancePoints);
			if (points === NaN || points < 0)
				delete event.attendancePoints;
		}

		return event;
	};

	Event.prototype.getPublic = function(admin) {
		return {
			uuid             : this.getDataValue('uuid'),
			organization     : this.getDataValue('organization'),
			committee        : this.getDataValue('committee'),
			cover            : this.getDataValue('cover'),
			title            : this.getDataValue('title'),
			description      : this.getDataValue('description'),
			location         : this.getDataValue('location'),
			eventLink        : this.getDataValue('eventLink'),
			startDate        : this.getDataValue('startDate'),
			endDate          : this.getDataValue('endDate'),
			attendanceCode   : admin ? this.getDataValue('attendanceCode') : undefined,
			attendancePoints : this.getDataValue('attendancePoints'),
		};
	};

	return Event;
};
