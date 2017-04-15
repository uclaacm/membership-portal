const Sequelize = require('sequelize');
const logger = require('../../logger');
const config = require('../../config');

let db = new Sequelize(config.database.uri, { logging: config.isDevelopment ? logger.debug : false });

let User = db.define('user', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	}, 
	uuid: {
		type: Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4
	},
	picture: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false
	},
	state: {
		type: Sequelize.ENUM('PENDING', 'ACTIVE', 'BLOCKED'),
		defaultValue: 'PENDING'
	},
	firstName: {
		type: Sequelize.STRING,
		allowNull: false
	},
	lastName: {
		type: Sequelize.STRING,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	salt: {
		type: Sequelize.STRING,
		allowNull: false
	},
	lastLogin: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
}, {
	classMethods: {
		findByUUID: function(uuid) {
			return this.findOne({ where : { uuid } });
		}
	},
	
	instanceMethods: {
		getPublicProfile: function() {
			return {
				firstName: this.getDataValue('firstName'),
				lastName : this.getDataValue('lastName'),
				picture  : this.getDataValue('picture'),
			};
		},

		getUserProfile: function() {
			return {
				firstName: this.getDataValue('firstName'),
				lastName : this.getDataValue('lastName'),
				picture  : this.getDataValue('picture'),
				email    : this.getDataValue('email'),	
			};
		}
	}
});
module.exports = User;
