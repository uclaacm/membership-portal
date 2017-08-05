const _ = require('underscore');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const HASH_ROUNDS = 10;

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
		profileId: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: {
					msg: "The email you entered is not valid"
				},
				notEmpty: {
					msg: "The email is a required field"
				}
			}
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
			validate: {
				len: {
					args: [2, 255],
					msg: "Your first name must be at least 2 characters long"
				},
				notEmpty: {
					msg: "The first name is a required field"
				}
			}
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				len: {
					args: [2, 255],
					msg: "Your last name must be at least 2 characters long"
				},
				notEmpty: {
					msg: "The last name is a required field"
				}
			}
		},
		hash: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "The password cannot be empty"
				}
			}
		},
		year: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				isIn: {
					args: [[1, 2, 3, 4, 5]],
					msg: "Your year must be one of [1, 2, 3, 4, 5]"
				},
				notEmpty: {
					msg: "The year is a required field"
				}
			}
		},
		major: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				len: {
					args: [2, 255],
					msg: "Your major must be at least 2 characters long"
				},
				notEmpty: {
					msg: "The major is a required field"
				}
			}
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
			},
			{
				name: 'points_btree_index',
				method: 'BTREE',
				fields: ['points', { attribute: 'points', order: 'DESC' }]
			}
		]
	});

	User.findByUUID = function(uuid) {
		return this.findOne({ where : { uuid } });
	};

	User.findByEmail = function(email) {
		return this.findOne({ where : { email } });
	};

	User.findByAccessCode = function(accessCode) {
		return this.findOne({ where : { accessCode } });
	};

	User.generateHash = function(password) {
		return bcrypt.hash(password, HASH_ROUNDS);
	};

	User.generateAccessCode = function() {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, data) => {
				if (err)
					return reject(err);
				resolve(data.toString('hex'));
			});
		});
	};

	User.getLeaderboard = function(offset, limit) {
		if (!offset || offset < 0) offset = 0;
		if (!limit || limit < 0)  limit = undefined;
		return this.findAll({ where: { accessType: 'STANDARD' }, offset, limit, order: [['points', 'DESC']] });
	};

	User.sanitize = function(user) {
		user = _.pick(user, ['profileId', 'email', 'firstName', 'lastName', 'year', 'major']);
		if (user.email)
			user.email = user.email.toLowerCase();
		return user;
	};

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
		const profileId = this.getDataValue('profileId');
		return {
			uuid       : this.getDataValue('uuid'),
			firstName  : this.getDataValue('firstName'),
			lastName   : this.getDataValue('lastName'),
			picture    : profileId ? 'https://graph.facebook.com/' + profileId + '/picture?width=300' : null,
			email      : this.getDataValue('email'),
			year       : this.getDataValue('year'),
			major      : this.getDataValue('major'),
			points     : this.getDataValue('points')
		};
	};

	User.Instance.prototype.verifyPassword = function(password) {
		return bcrypt.compare(password, this.getDataValue('hash'));
	};

	User.Instance.prototype.updatePassword = function(password) {
		let self = this;
		return User.generateHash(password).then(hash => {
			self.hash = hash;
		});
	};

	User.Instance.prototype.isAdmin = function() {
		return this.getDataValue('accessType') === 'ADMIN';
	};

	User.Instance.prototype.isStandard = function() {
		return this.getDataValue('accessType') === 'STANDARD';
	};

	User.Instance.prototype.isRestricted = function() {
		return this.getDataValue('accessType') === 'RESTRICTED';
	};

	User.Instance.prototype.isActive = function() {
		return this.getDataValue('state') === 'ACTIVE';
	};

	User.Instance.prototype.isPending = function() {
		return this.getDataValue('state') === 'PENDING';
	};

	User.Instance.prototype.isBlocked = function() {
		return this.getDataValue('state') === 'BLOCKED';
	};

	return User;
};
