const bcrypt = require('bcryptjs');

const HASH_ROUNDS = 10;

module.exports = (Sequelize, db) => {
  const Secret = db.define(
    'secret',
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
      //
      // Nullable: a settings row can exist with a transport selected but no credential stored
      // yet (picking "none", or setting a from-address before the token arrives).
      hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // Non-secret configuration belonging to this secret, as JSON. Holds things like the
      // email transport, host and from-address — never the credential, which lives in `hash`.
      meta: {
        type: Sequelize.TEXT,
      },
    },
    {
      // creating indices on frequently accessed fields improves efficiency
      indexes: [
        // a hash index on the name makes lookup by name O(1)
        {
          unique: true,
          fields: ['name'],
        },
      ],
    },
  );

  Secret.findByName = function (name) {
    return this.findOne({ where: { name } });
  };

  Secret.generateHash = function (password) {
    return bcrypt.hash(password, HASH_ROUNDS);
  };

  Secret.prototype.verifyPassword = function (password) {
    return bcrypt.compare(password, this.getDataValue('hash'));
  };

  return Secret;
};
