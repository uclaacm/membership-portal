module.exports = (Sequelize, db) => {
  /**
    * An image stores the BLOB data as-is
  */
  const Image = db.define(
    'image',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },

      data: {
        type: Sequelize.BLOB('long'),
        allowNull: false,
      },

      mimetype: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      // creating indices on frequently accessed fields improves efficiency
      indexes: [
        // a hash index on the uuid makes lookup by UUID O(1)
        {
          unique: true,
          fields: ['uuid'],
        },
      ],
    },
  );

  Image.getAll = function getAll() {
    return this.findAll({ order: [['id', 'ASC']] }).map(e => e.getMetadata());
  };

  Image.destroyByUUID = function destroyByUUID(uuid) {
    return this.destroy({ where: { uuid } });
  };

  Image.getImage = function getImage(uuid) {
    return this.findAll({ where: { uuid } });
  };

  Image.prototype.getMetadata = function getMetadata() {
    return {
      uuid: this.getDataValue('uuid'),
      mimetype: this.getDataValue('mimetype'),
      size: this.getDataValue('size'),
    };
  };

  return Image;
};
