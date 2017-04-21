const _ = require('underscore');

module.exports = (Sequelize, db) => {
    let Event = db.define('event', {
        id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		}, 
		uuid: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4
		},
        organization: {
            type: Sequelize.STRING,
            defaultValue: "ACM",
            validate: { len: [3, 255] }
        },
        committee: {
            type: Sequelize.ENUM("ICPC","Hack","VRCG","AI","ACM-W")
        },
        thumb: {
            type: Sequelize.STRING,
            validate: { len: [3, 255] }
        },
        cover: {
            type: Sequelize.STRING,
            validate: { len: [3, 255] }
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: { len: [3, 255] }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: { is: /^.{3,}$/ }
        },
        location: {
            type: Sequelize.STRING,
            validate: { len: [3, 255] }
        },
        eventLink: {
            type: Sequelize.STRING,
            validate: { len: [3, 255] }
        },
        startDate: {
            type: Sequelize.DATE,
            allowNull: false,
            validate: { isDate: true }
        },
        endDate: {
            type: Sequelize.DATE,
            allowNull: false,
            validate: { isDate: true }
        },
        attendanceCode: {
            type: Sequelize.STRING,
            validate: { len: [3, 255] }
        },
        attendancePoints: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            validate: { min: 0 }
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['uuid']
            },
            {
                name: 'start_date_index',
                method: 'BTREE',
                fields: ['startDate', { attribute: 'startDate', order: 'DESC' }]
            },
            {
                name: 'end_date_index',
                method: 'BTREE',
                fields: ['endDate', { attribute: 'endDate', order: 'DESC' }]
            }
        ]
    });
    
    Event.findByUUID = function(uuid) {
        return this.findOne({ where: { uuid } });
    };

    Event.eventExists = function(uuid) {
        return this.count({ where: { uuid } }).then(c => c !== 0);
    };

    Event.destroyByUUID = function(uuid) {
        return this.destroy({ where: { uuid } });
    };

    Event.getPastEvents = function() {
        let now = new Date();
        return this.findAll({ where: { startDate : { $lte : now } } });
    };

    Event.getFutureEvents = function() {
        let now = new Date();
        return this.findAll({ where: { startDate : { $gte : now } } });
    };

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

    Event.Instance.prototype.getPublic = function() {
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
            attendancePoints : this.getDataValue('attendancePoints'),
        };
    };

    return Event;
};