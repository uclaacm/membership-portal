const bcrypt = require("bcryptjs");
const HASH_ROUNDS = 10;

module.exports = (Sequelize, db) => {
  const Secret = db.define(
    "secret",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // hash of secret
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "The password cannot be empty",
          },
        },
      },
    },
    {
      // creating indices on frequently accessed fields improves efficiency
      indexes: [
        // a hash index on the name makes lookup by name O(1)
        {
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );

  Secret.findByName = function (name) {
    return this.findOne({ where: { name } });
  };

  Secret.generateHash = function (password) {
    return bcrypt.hash(password, HASH_ROUNDS);
  };

  Secret.prototype.verifyPassword = function (password) {
    return bcrypt.compare(password, this.getDataValue("hash"));
  };

  return Secret;
};
