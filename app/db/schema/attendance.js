module.exports = (Sequelize, db) => {
	const Attendance = db.define('attendance', {
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
			allowNull: false,
			validate: {
				isUUID: {
					args: 4,
					msg: "Invalid value for user UUID"
				},
				notEmpty: {
					msg: "The user UUID is a required field"
				}
			}
		},
		event: {
			type: Sequelize.UUID,
			allowNull: false,
			validate: {
				isUUID: {
					args: 4,
					msg: "Invalid value for user UUID"
				},
				notEmpty: {
					msg: "The user UUID is a required field"
				}
			}
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
			},
			{
				name: 'attendance_date_btree_index',
				method: 'BTREE',
				fields: ['date', { attribute: 'date', order: 'ASC' }]
			},
			{
				name: 'attendance_user_btree_index',
				method: 'BTREE',
				fields: ['user', { attribute: 'user', order: 'ASC' }]
			},
			{
				name: 'attendance_event_btree_index',
				method: 'BTREE',
				fields: ['event', { attribute: 'event', order: 'ASC' }]
			},
		]
	});

	Attendance.getAttendanceForUser = function(user) {
		return this.findAll({ where: { user }, order: [['date', 'ASC']] });
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