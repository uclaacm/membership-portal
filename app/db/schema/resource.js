const _ = require('underscore');

module.exports = (Sequelize, db) => {
  const Resource = db.define('resource', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // resource UUID: uniquely identifies an event
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },

    // uuid of the event the resource is associated with
    event: {
      type: Sequelize.UUID,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'Invalid value for event UUID',
        },
        notEmpty: {
          msg: 'The event UUID is a required field',
        },
      },
    },

    // resource type
    type: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'The type field is required',
        },
      },
    },

    // resource title
    title: {
      type: Sequelize.STRING,
      validate: {
        len: {
          args: [3, 255],
          msg: 'The title must be between 3 and 255 characters long',
        },
      },
    },

    // resource value
    value: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'The resource value must be between 3 and 255 characters long',
        },
      },
    },
  }, {
    // creating indices on frequently accessed fields improves efficiency
    indexes: [
      // a hash index on the uuid makes lookup by UUID O(1)
      {
        unique: true,
        fields: ['uuid'],
      },

      // a BTREE index on the event makes retrieving all resources for an event O(N)
      {
        name: 'resource_event_index',
        method: 'BTREE',
        fields: ['event', { attribute: 'event', order: 'ASC' }],
      },
    ],
  });

  Resource.getResourcesForOneEvent = event => Resource.findAll({ where: { event } });

  Resource.getResourcesForEvents = events => Resource.findAll({
    where: { event: { $in: events } },
  });

  Resource.destroyByEvent = event => Resource.destroy({ where: { event } });

  Resource.addResources = (resources, event) => {
    if (!resources) return;
    (resources || []).forEach((resource) => {
      const sanitizedResource = Resource.sanitize(resource);
      sanitizedResource.event = event;
      if (resource.uuid == null) {
        Resource.create(sanitizedResource);
      } else {
        Resource.findOne({ where: { event } })
          .then((record) => {
            if (!record) {
              return;
            }
            record.update(sanitizedResource);
          });
      }
    });
  };

  Resource.sanitize = resource => _.pick(resource, ['type', 'title', 'value']);

  Resource.prototype.getPublic = function () {
    return {
      uuid: this.getDataValue('uuid'),
      event: this.getDataValue('event'),
      type: this.getDataValue('type'),
      title: this.getDataValue('title'),
      value: this.getDataValue('value'),
    };
  };

  return Resource;
};
