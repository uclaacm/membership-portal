const bcrypt = require('bcryptjs');

module.exports = (Sequelize, db) => {
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
			allowNull: false,
			validate: { isEmail: true }
		},
		accessType: {
			type: Sequelize.ENUM('RESTRICTED','STANDARD','ADMIN'),
			defaultValue: 'STANDARD'
		},
		state: {
			type: Sequelize.ENUM('PENDING', 'ACTIVE', 'BLOCKED', 'PASSWORD_RESET'),
			defaultValue: 'PENDING'
		},
		accessCode: {
			type: Sequelize.STRING
		},
		firstName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: { len: [2, 30] }
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: { len: [2, 30] }
		},
		hash: {
			type: Sequelize.STRING,
			allowNull: false
		},
		salt: {
			type: Sequelize.STRING,
			allowNull: false
		},
		year: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: { isIn: [[1, 2, 3, 4, 5]] }
		},
		major: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: { len: [2, 64] }
		},
		points: {
			type: Sequelize.INTEGER,
			defaultValue: 0
		},
		lastLogin: {
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
				unique: true,
				fields: ['email']
			},
			{
				unique: true,
				fields: ['accessCode']
			}
		]
	});

	User.findByUUID = function(uuid) {
		return this.findOne({ where : { uuid } });
	};

	User.findByEmail = function(email) {
		return this.findOne({ where : { email } });
	};

	User.generateSaltAndHash = function(password) {
		// TODO: return a promise that returns (salt, hash)
	}

	User.Instance.prototype.addPoints = function(points) {
		return this.increment({ points });
	};

	User.Instance.prototype.getPublicProfile = function() {
		return {
			firstName : this.getDataValue('firstName'),
			lastName  : this.getDataValue('lastName'),
			picture   : this.getDataValue('picture'),
			points    : this.getDataValue('points'),
		};
	};

	User.Instance.prototype.getUserProfile = function() {
		return {
			firstName  : this.getDataValue('firstName'),
			lastName   : this.getDataValue('lastName'),
			picture    : this.getDataValue('picture'),
			email      : this.getDataValue('email'),
			year       : this.getDataValue('year'),
			major      : this.getDataValue('major'),
			points     : this.getDataValue('points')
		};
	};

	User.Instance.prototype.verifyPassword = function(password) {
		return bcrypt.compare(password, this.getDataValue('hash'));
	};

	User.Instance.prototype.isAdmin() = function() {
		return this.getDataValue('accessType') === 'ADMIN';
	};

	User.Instance.prototype.isStandard() = function() {
		return this.getDataValue('accessType') === 'STANDARD';
	};

	User.Instance.prototype.isRestricted() = function() {
		return this.getDataValue('accessType') === 'RESTRICTED';
	};

	return User;
};
