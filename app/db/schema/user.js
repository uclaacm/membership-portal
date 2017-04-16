module.exports = (Sequelize, db) => {
	return db.define('user', {
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
			type: Sequelize.ENUM('PENDING', 'ACTIVE', 'BLOCKED', 'PASSWORD_RESET'),
			defaultValue: 'PENDING'
		},
		accessCode: {
			type: Sequelize.STRING
		},
		firstName: {
			type: Sequelize.STRING,
			allowNull: false
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: false
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
			allowNull: false
		},
		major: {
			type: Sequelize.STRING,
			allowNull: false
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
		],
		classMethods: {
			findByUUID: function(uuid) {
				return this.findOne({ where : { uuid } });
			}
		},
		
		instanceMethods: {
			getPublicProfile: function() {
				return {
					firstName : this.getDataValue('firstName'),
					lastName  : this.getDataValue('lastName'),
					picture   : this.getDataValue('picture'),
					points    : this.getDataValue('points'),
				};
			},

			getUserProfile: function() {
				return {
					firstName : this.getDataValue('firstName'),
					lastName  : this.getDataValue('lastName'),
					picture   : this.getDataValue('picture'),
					email     : this.getDataValue('email'),
					year      : this.getDataValue('year'),
					major     : this.getDataValue('major'),
					points    : this.getDataValue('points'),	
				};
			}
		}
	});
};