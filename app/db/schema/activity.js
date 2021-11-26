module.exports = (Sequelize, db) => {
	/**
	 * Activity keeps track of non-trivial things users are doing in the system. Each
	 * Activity object represents one action of a specified type
	 */
	const Activity = db.define('activity', {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},

		// uuid that uniquely identifies this activity
		uuid: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
		},

		// the user that committed this action
		user: {
			type: Sequelize.UUID,
			allowNull: false,
			validate: {
				isUUID: {
					args: 4,
					msg: "Invalid value for user UUID",
				},
				notEmpty: {
					msg: "The user UUID is a required field",
				},
			},
		},

		// the type of action committed
		//   ACCOUNT_CREATE             - a user created an account
		//   ACCOUNT_ACTIVATE           - the user activated their account
		//   ACCOUNT_RESET_PASS         - the user reset their password
		//   ACCOUNT_RESET_PASS_REQUEST - the user requested a code to reset their password
		//   ACCOUNT_UPDATE_INFO        - the user updated some account information
		//   ACCOUNT_LOGIN              - the user logged into their account
		//   ATTEND_EVENT               - the user attended an event
		//   MILESTONE                  - a custom event (milestone)
		type: {
			type: Sequelize.ENUM(
				'ACCOUNT_CREATE',
				'ACCOUNT_ACTIVATE',
				'ACCOUNT_UPDATE_INFO',
				'ACCOUNT_LOGIN',
				'ATTEND_EVENT',
				'MILESTONE'
			),
			allowNull: false,
		},

		// decription of the event, or some other human-readable context/information regarding
		// this activity
		description: {
			type: Sequelize.STRING,
		},

		// points earned as a result of this activity (if applicable)
		pointsEarned: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},

		// date of the activity
		date: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},

		// whether this is a public or internal activity
		// public activities are shown to the user, whereas internal activites are used for
		// logging purposes.
		public: {
			type: Sequelize.BOOLEAN,
			default: false,
		},
	}, {
		// set the table name in the database
		tableName: 'activity',

		// creating indices on frequently accessed fields improves efficiency
		indexes: [
			// a hash index on the uuid makes lookup by UUID O(1)
			{
				unique: true,
				fields: ['uuid']
			},

			// a BTREE index on the type makes retrieving activities by type O(N)
			{
				name: 'activity_type_btree_index',
				method: 'BTREE',
				fields: ['type', { attribute: 'type', order: 'ASC' }]
			},

			// a BTREE index on public makes retrieving public activities O(N), where N is
			// the number of public activities
			{
				name: 'activity_public_btree_index',
				method: 'BTREE',
				fields: ['public', { attribute: 'public', order: 'ASC' }]
			},

			// a BTREE index on the date makes retrieving all events in chronological order O(N)
			{
				name: 'activity_date_btree_index',
				method: 'BTREE',
				fields: ['date', { attribute: 'date', order: 'ASC' }]
			},

			// a BTREE index on the user makes retrieving all events for a user O(N), where N
			// is the number of activities for the user
			{
				name: 'activity_user_btree_index',
				method: 'BTREE',
				fields: ['user', { attribute: 'user', order: 'ASC' }]
			},
		],
	});

	Activity.accountCreated = function(user, description) {
		return this.create({
			user,
			description,
			type: 'ACCOUNT_CREATE',
			public: true,
		});
	};

	Activity.accountActivated = function(user, description) {
		return this.create({
			user,
			description,
			type: 'ACCOUNT_ACTIVATE',
		});
	};

	Activity.accountUpdatedInfo = function(user, description) {
		return this.create({
			user,
			description,
			type: 'ACCOUNT_UPDATE_INFO',
		});
	};

	Activity.accountLoggedIn = function(user, description) {
		return this.create({
			user,
			description,
			type: 'ACCOUNT_LOGIN',
		});
	};

	Activity.attendedEvent = function(user, description, pointsEarned) {
		return this.create({
			user,
			description,
			pointsEarned,
			type: 'ATTEND_EVENT',
			public: true,
		});
	};

	Activity.createMilestone = function(user, description, pointsEarned) {
		return this.create({
			user,
			description,
			pointsEarned,
			type: 'MILESTONE',
			public: true,
		});
	};

	Activity.getPublicStream = function(user) {
		return this.findAll({ where: { user, public: true }, order: [['date', 'ASC']] });
	};

	Activity.prototype.getPublic = function() {
		return {
			uuid         : this.getDataValue('uuid'),
			user         : this.getDataValue('user'),
			type         : this.getDataValue('type'),
			date         : this.getDataValue('date'),
			description  : this.getDataValue('description'),
			pointsEarned : this.getDataValue('pointsEarned'),
		};
	};

	return Activity;
};