module.exports = (Sequelize, db) => {
  const Activity = db.define('activity', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
    },
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
    type: {
      type: Sequelize.ENUM(
        'ACCOUNT_CREATE',
        'ACCOUNT_ACTIVATE',
        'ACCOUNT_RESET_PASS',
        'ACCOUNT_RESET_PASS_REQUEST',
        'ACCOUNT_UPDATE_INFO',
        'ACCOUNT_LOGIN',
        'ATTEND_EVENT'
      ),
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    pointsEarned: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    date: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
    },
    public: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
  }, {
    tableName: 'activities',
    indexes: [
      {
        name: 'activities_date_btree_index',
				method: 'BTREE',
				fields: ['date', { attribute: 'date', order: 'ASC' }]
      },
      {
        name: 'activities_user_btree_index',
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

  Activity.accountResetPassword = function(user, description) {
    return this.create({ 
      user,
      description,
      type: 'ACCOUNT_RESET_PASS',
    });
  };

  Activity.accountRequestedResetPassword = function(user, description) {
    return this.create({ 
      user,
      description,
      type: 'ACCOUNT_RESET_PASS_REQUEST',
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

  Activity.getPublicStream = function(user) {
		return this.findAll({ where: { user, public: true }, order: [['date', 'ASC']] });
  };

  Activity.Instance.prototype.getPublic = function() {
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