module.exports = (Sequelize, db) => {
  const User = db.define(
    'user',
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
            msg: 'The email you entered is not valid',
          },
          notEmpty: {
            msg: 'The email is a required field',
          },
        },
      },

      // type of account
      //   RESTRICTED - not used currently
      //   STANDARD   - a regular member
      //   ADMIN      - admin type user
      accessType: {
        type: Sequelize.ENUM('RESTRICTED', 'STANDARD', 'ADMIN', 'SUPERADMIN'),
        defaultValue: 'STANDARD',
      },

      // account state
      //   PENDING        - account pending activation (newly created)
      //   ACTIVE         - account activated and in good standing
      //   BLOCKED        - account is blocked, login is denied
      state: {
        type: Sequelize.ENUM('PENDING', 'ACTIVE', 'BLOCKED'),
        defaultValue: 'PENDING',
      },

      // user's first name
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: 'Your first name must be at least 2 characters long',
          },
          notEmpty: {
            msg: 'The first name is a required field',
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
            msg: 'Your last name must be at least 2 characters long',
          },
          notEmpty: {
            msg: 'The last name is a required field',
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
            msg: 'Your year must be one of [1, 2, 3, 4, 5]',
          },
          notEmpty: {
            msg: 'The year is a required field',
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
            msg: 'Your major must be at least 2 characters long',
          },
          notEmpty: {
            msg: 'The major is a required field',
          },
        },
      },

      // user's biography
      bio: {
        type: Sequelize.TEXT,
        validate: {
          // added limit to bio length
          len: {
            args: [0, 1000],
            msg: 'Your bio must be at most 1000 characters long',
          },
        },
      },

      // user's social links
      linkedinUrl: {
        type: Sequelize.STRING,
        validate: {
          isUrl: {
            msg: 'The LinkedIn URL must be a valid URL',
          },
        },
      },

      githubUrl: {
        type: Sequelize.STRING,
        validate: {
          isUrl: {
            msg: 'The GitHub URL must be a valid URL',
          },
        },
      },

      portfolioUrl: {
        type: Sequelize.STRING,
        validate: {
          isUrl: {
            msg: 'The portfolio URL must be a valid URL',
          },
        },
      },

      personalWebsite: {
        type: Sequelize.STRING,
        validate: {
          isUrl: {
            msg: 'The personal website URL must be a valid URL',
          },
        },
      },

      resumeUrl: {
        type: Sequelize.STRING,
        validate: {
          isUrl: {
            msg: 'The resume URL must be a valid URL',
          },
        },
      },

      // user's skills
      skills: {
        type: Sequelize.JSONB,
        defaultValue: [],
        validate: {
          isShortStringArray(arr) {
            if (!Array.isArray(arr)) {
              throw new Error(`Skills must be an array; got ${typeof arr} instead.`);
            }
            if (arr.length > 20) {
              throw new Error(`Skills array may not have more than 20 items; got ${arr.length}.`);
            }
            const badVal = arr.find((skill) => typeof skill !== 'string');
            if (badVal !== undefined) {
              throw new Error(`Each skill must be a string; encountered ${typeof badVal} instead.`);
            }
          },
        },
      },

      careerInterests: {
        type: Sequelize.JSONB,
        defaultValue: [],
        validate: {
          isShortStringArray(arr) {
            if (!Array.isArray(arr)) {
              throw new Error(`Career interests must be an array; got ${typeof arr} instead.`);
            }
            if (arr.length > 20) {
              throw new Error(`Career interests array may not have more than 20 items; got ${arr.length}.`);
            }
            const badVal = arr.find((interest) => typeof interest !== 'string');
            if (badVal !== undefined) {
              throw new Error(`Each career interest must be a string; encountered ${typeof badVal} instead.`);
            }
          },
        },
      },

      // whether the user's profile is public
      isProfilePublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      // user's pronouns
      pronouns: {
        type: Sequelize.STRING,
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
          fields: ['uuid'],
        },

        // a hash index on the email makes lookup by email O(1)
        {
          unique: true,
          fields: ['email'],
        },

        // a BTREE index on the uuid makes retrieving the leaderboard O(N)
        {
          name: 'user_points_btree_index',
          method: 'BTREE',
          fields: ['points', { attribute: 'points', order: 'DESC' }],
        },

        // For efficient directory queries
        {
          fields: ['isProfilePublic'],
        },
      ],
    },
  );

  User.findByUUID = function (uuid) {
    return this.findOne({ where: { uuid } });
  };

  User.findByEmail = function (email) {
    return this.findOne({ where: { email } });
  };

  User.getLeaderboard = function (offset, limit) {
    const safeOffset = (!offset || offset < 0) ? 0 : offset;
    const safeLimit = (!limit || limit < 0) ? undefined : limit;
    return this.findAll({
      where: { accessType: 'STANDARD' },
      offset: safeOffset,
      limit: safeLimit,
      order: [['points', 'DESC']],
    });
  };

  User.getAdmins = function () {
    return this.findAll({
      where: {
        accessType: {
          [Sequelize.Op.or]: ['ADMIN', 'SUPERADMIN'],
        },
      },
    });
  };

  User.prototype.addPoints = function (points) {
    return this.increment({ points });
  };

  User.prototype.getBaseProfile = function () {
    return {
      firstName: this.getDataValue('firstName'),
      lastName: this.getDataValue('lastName'),
      picture: this.getDataValue('picture'),
      points: this.getDataValue('points'),
      pronouns: this.getDataValue('pronouns'),
    };
  };

  User.prototype.getPublicProfile = function () {
    if (this.getDataValue('isProfilePublic')) {
      return {
        bio: this.getDataValue('bio'),
        skills: this.getDataValue('skills'),
        careerInterests: this.getDataValue('careerInterests'),
        linkedinUrl: this.getDataValue('linkedinUrl'),
        githubUrl: this.getDataValue('githubUrl'),
        portfolioUrl: this.getDataValue('portfolioUrl'),
        personalWebsite: this.getDataValue('personalWebsite'),
      };
    }
    return null;
  };

  User.prototype.getUserProfile = function () {
    return {
      uuid: this.getDataValue('uuid'),
      firstName: this.getDataValue('firstName'),
      lastName: this.getDataValue('lastName'),
      picture: this.getDataValue('picture'),
      email: this.getDataValue('email'),
      year: this.getDataValue('year'),
      major: this.getDataValue('major'),
      points: this.getDataValue('points'),
      pronouns: this.getDataValue('pronouns'),
      bio: this.getDataValue('bio'),
    };
  };

  User.prototype.getCareerProfile = function () {
    return {
      linkedinUrl: this.getDataValue('linkedinUrl'),
      githubUrl: this.getDataValue('githubUrl'),
      portfolioUrl: this.getDataValue('portfolioUrl'),
      personalWebsite: this.getDataValue('personalWebsite'),
      resumeUrl: this.getDataValue('resumeUrl'),
      skills: this.getDataValue('skills'),
      careerInterests: this.getDataValue('careerInterests'),
      isProfilePublic: this.getDataValue('isProfilePublic'),
    };
  };

  User.prototype.hasCompleteProfile = function () {
    return !!(
      this.getDataValue('bio')
      && this.getDataValue('major')
      && this.getDataValue('year')
      && this.getDataValue('skills')
      && this.getDataValue('skills').length > 0
      && this.getDataValue('careerInterests')
      && this.getDataValue('careerInterests').length > 0
    );
  };

  User.prototype.isRestricted = function () {
    return this.getDataValue('accessType') === 'RESTRICTED';
  };

  User.prototype.isStandard = function () {
    return this.getDataValue('accessType') === 'STANDARD';
  };

  User.prototype.isAdmin = function () {
    return (
      this.getDataValue('accessType') === 'ADMIN'
      || this.getDataValue('accessType') === 'SUPERADMIN'
    );
  };

  User.prototype.isSuperAdmin = function () {
    return this.getDataValue('accessType') === 'SUPERADMIN';
  };

  User.prototype.isPending = function () {
    return this.getDataValue('state') === 'PENDING';
  };

  User.prototype.isActive = function () {
    return this.getDataValue('state') === 'ACTIVE';
  };

  User.prototype.isBlocked = function () {
    return this.getDataValue('state') === 'BLOCKED';
  };

  return User;
};
