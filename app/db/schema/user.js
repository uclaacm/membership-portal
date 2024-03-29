module.exports = (Sequelize, db) => {
  const User = db.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // user ID: main way of querying the user
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },

      // email address of the user
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "The email you entered is not valid",
          },
          notEmpty: {
            msg: "The email is a required field",
          },
        },
      },

      // type of account
      //   RESTRICTED - not used currently
      //   STANDARD   - a regular member
      //   ADMIN      - admin type user
      accessType: {
        type: Sequelize.ENUM("RESTRICTED", "STANDARD", "ADMIN", "SUPERADMIN"),
        defaultValue: "STANDARD",
      },

      // account state
      //   PENDING        - account pending activation (newly created)
      //   ACTIVE         - account activated and in good standing
      //   BLOCKED        - account is blocked, login is denied
      state: {
        type: Sequelize.ENUM("PENDING", "ACTIVE", "BLOCKED"),
        defaultValue: "PENDING",
      },

      // user's first name
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: "Your first name must be at least 2 characters long",
          },
          notEmpty: {
            msg: "The first name is a required field",
          },
        },
      },

      // user's last name
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: "Your last name must be at least 2 characters long",
          },
          notEmpty: {
            msg: "The last name is a required field",
          },
        },
      },

      picture: {
        type: Sequelize.STRING,
      },

      // user's year
      //   typical mapping: [1,2,3,4,5] => [Freshman,Sophomore,Junior,Senior,Post-senior]
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isIn: {
            args: [[1, 2, 3, 4, 5]],
            msg: "Your year must be one of [1, 2, 3, 4, 5]",
          },
          notEmpty: {
            msg: "The year is a required field",
          },
        },
      },

      // user's major
      major: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: "Your major must be at least 2 characters long",
          },
          notEmpty: {
            msg: "The major is a required field",
          },
        },
      },

      // amount of points the user has
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      // date of last login
      lastLogin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      // creating indices on frequently accessed fields improves efficiency
      indexes: [
        // a hash index on the uuid makes lookup by UUID O(1)
        {
          unique: true,
          fields: ["uuid"],
        },

        // a hash index on the email makes lookup by email O(1)
        {
          unique: true,
          fields: ["email"],
        },

        // a BTREE index on the uuid makes retrieving the leaderboard O(N)
        {
          name: "user_points_btree_index",
          method: "BTREE",
          fields: ["points", { attribute: "points", order: "DESC" }],
        },
      ],
    }
  );

  User.findByUUID = function (uuid) {
    return this.findOne({ where: { uuid } });
  };

  User.findByEmail = function (email) {
    return this.findOne({ where: { email } });
  };

  User.getLeaderboard = function (offset, limit) {
    if (!offset || offset < 0) offset = 0;
    if (!limit || limit < 0) limit = undefined;
    return this.findAll({
      where: { accessType: "STANDARD" },
      offset,
      limit,
      order: [["points", "DESC"]],
    });
  };

  User.getAdmins = function () {
    return this.findAll({
      where: {
        accessType: {
          [Sequelize.Op.or]: ["ADMIN", "SUPERADMIN"],
        },
      },
    });
  };

  User.prototype.addPoints = function (points) {
    return this.increment({ points });
  };

  User.prototype.getPublicProfile = function () {
    return {
      firstName: this.getDataValue("firstName"),
      lastName: this.getDataValue("lastName"),
      picture: this.getDataValue("picture"),
      points: this.getDataValue("points"),
    };
  };

  User.prototype.getUserProfile = function () {
    const uuid = this.getDataValue("uuid");
    return {
      uuid,
      firstName: this.getDataValue("firstName"),
      lastName: this.getDataValue("lastName"),
      picture: this.getDataValue("picture"),
      email: this.getDataValue("email"),
      year: this.getDataValue("year"),
      major: this.getDataValue("major"),
      points: this.getDataValue("points"),
    };
  };

  User.prototype.isRestricted = function () {
    return this.getDataValue("accessType") === "RESTRICTED";
  };

  User.prototype.isStandard = function () {
    return this.getDataValue("accessType") === "STANDARD";
  };

  User.prototype.isAdmin = function () {
    return (
      this.getDataValue("accessType") === "ADMIN" ||
      this.getDataValue("accessType") === "SUPERADMIN"
    );
  };

  User.prototype.isSuperAdmin = function () {
    return this.getDataValue("accessType") === "SUPERADMIN";
  };

  User.prototype.isPending = function () {
    return this.getDataValue("state") === "PENDING";
  };

  User.prototype.isActive = function () {
    return this.getDataValue("state") === "ACTIVE";
  };

  User.prototype.isBlocked = function () {
    return this.getDataValue("state") === "BLOCKED";
  };

  return User;
};
