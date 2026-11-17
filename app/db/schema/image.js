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

      // Pixel dimensions, parsed from the file header at upload time. Nullable because images
      // uploaded before this column existed have no stored dimensions, and because the parser
      // returns nothing for formats it does not recognize.
      width: {
        type: Sequelize.INTEGER,
      },

      height: {
        type: Sequelize.INTEGER,
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
    return this.findAll({ order: [['id', 'ASC']] }).map((e) => e.getMetadata());
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
      width: this.getDataValue('width'),
      height: this.getDataValue('height'),
    };
  };

  return Image;
};
