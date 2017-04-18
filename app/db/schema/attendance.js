module.exports = (Sequelize, db) => {
    let Attendance = db.define('attendance', {
        id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		}, 
		uuid: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4
		},
        user: {
            type: Sequelize.UUID,
            allowNull: false
        },
        event: {
            type: Sequelize.UUID,
            allowNull: false
        },
        date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['uuid']
            },
            {
                unique: false,
                fields: ['user']
            },
            {
                unique: false,
                fields: ['event']
            }
        ]
    });

    Attendance.getAttendanceForUser = function(user) {
        return this.findAll({ where: { user } });
    };

    Attendance.getAttendanceForEvent = function(event) {
        return this.findAll({ where: { event } });
    };

    Attendance.userAttendedEvent = function(user, event) {
        return this.count({ where : { user, event } }).then(c => c !== 0);
    };

    Attendance.attendEvent = function(user, event) {
        return this.create({ user, event });
    };

    Attendance.Instance.prototype.getPublic = function() {
        return {
            uuid  : this.getDataValue('uuid'),
            user  : this.getDataValue('user'),
            event : this.getDataValue('event'),
            date  : this.getDataValue('date')
        };
    };

    return Attendance;
};