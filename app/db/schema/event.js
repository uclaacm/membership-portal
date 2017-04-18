module.exports = (Sequelize, db) => {
    return db.define('event', {
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
            allowNull: false
        },
        endDate: {
            type: Sequelize.DATE,
            allowNull: false
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
                fields: ['startDate', { attribute: 'title', collate: 'en_US', order: 'DESC' }]
            },
            {
                name: 'end_date_index',
                method: 'BTREE',
                fields: ['endDate', { attribute: 'title', collate: 'en_US', order: 'DESC' }]
            }
        ],
        classMethods: {
            findByUUID: function(uuid) {
                return this.findOne({ where : { uuid } });
            },
            eventExists: function(uuid) {
                return this.count({ where: { uuid } }).then(c => c !== 0);
            },
            getPastEvents: function() {
                let now = new Date();
                return this.findAll({ where: { startDate : { $lte : now } } });
            },
            getFutureEvents: function() {
                let now = new Date();
                return this.findAll({ where: { startDate : { $gte : now } } });
            }
        },

        instanceMethods: {
            getPublic: function() {
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
            }
        }
    });
};