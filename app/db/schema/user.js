const { COMMITTEES } = require('../../committees');

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
      //   OFFICER    - committee officer with elevated but scoped permissions
      //   ADMIN      - admin type user
      accessType: {
        type: Sequelize.ENUM('RESTRICTED', 'STANDARD', 'OFFICER', 'ADMIN', 'SUPERADMIN'),
        defaultValue: 'STANDARD',
      },

      // Title shown next to an elevated user in the Control Panel.
      //   admins   - the level label: 'Dev Team' or 'President' ('Super admin' is derived
      //              from accessType and is never stored here)
      //   officers - their role in the committee, defaulting to 'Officer'
      // Free text rather than an enum so chapter-specific titles don't need a migration.
      position: {
        type: Sequelize.STRING,
      },

      // email of the user who granted the current elevated role, for the audit trail.
      // Stored as an email rather than a FK so it survives the granter being removed.
      roleGrantedBy: {
        type: Sequelize.STRING,
      },

      // when the current elevated role was granted (also the officer 'since' date)
      roleGrantedAt: {
        type: Sequelize.DATE,
      },

      // last time this user made an authenticated request, refreshed at most hourly
      lastActiveAt: {
        type: Sequelize.DATE,
      },

      // committees the officer belongs to (only relevant when accessType is OFFICER)
      committees: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        validate: {
          isValidCommittee(value) {
            if (!Array.isArray(value)) return;
            const invalid = value.filter((c) => !COMMITTEES.includes(c));
            if (invalid.length > 0) {
              throw new Error(`Invalid committee(s): ${invalid.join(', ')}. Must be one of: ${COMMITTEES.join(', ')}`);
            }
          },
        },
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
            args: [{ host_whitelist: ['linkedin.com', 'www.linkedin.com'] }],
            msg: 'The LinkedIn URL must be a valid URL',
          },
        },
      },

      githubUrl: {
        type: Sequelize.STRING,
        validate: {
          isUrl: {
            args: [{ host_whitelist: ['github.com', 'www.github.com'] }],
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
        type: Sequelize.ARRAY(Sequelize.STRING),
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
        type: Sequelize.ARRAY(Sequelize.STRING),
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

  /**
   * Ranks every active member, not just STANDARD ones.
   *
   * Officers and admins earn points by attending events like anyone else, and excluding them
   * meant they could never see themselves on their own dashboard — the pinned "your rank" row
   * had nothing to pin.
   */
  User.getLeaderboard = function (offset, limit) {
    const safeOffset = (!offset || offset < 0) ? 0 : offset;
    const safeLimit = (!limit || limit < 0) ? undefined : limit;
    return this.findAll({
      where: { state: 'ACTIVE' },
      offset: safeOffset,
      limit: safeLimit,
      order: [['points', 'DESC'], ['lastName', 'ASC']],
    });
  };

  /**
   * The given user's position on the leaderboard, 1-indexed.
   *
   * Counts how many members outrank them rather than paging through the board, so it stays a
   * single indexed COUNT no matter how far down someone sits. Ties share a rank, matching how
   * the ordered list actually renders.
   *
   * Returns null only for someone the board does not list at all (a pending or blocked
   * account), so the UI can say "not ranked" rather than invent a position.
   */
  User.getRank = function (user) {
    if (user.getDataValue('state') !== 'ACTIVE') return Promise.resolve(null);
    return this.count({
      where: {
        state: 'ACTIVE',
        points: { [Sequelize.Op.gt]: user.getDataValue('points') },
      },
    }).then((ahead) => ahead + 1);
  };

  User.getAdmins = function () {
    return this.findAll({
      where: {
        accessType: {
          [Sequelize.Op.or]: ['ADMIN', 'SUPERADMIN'],
        },
      },
      // Super admin first, then by grant date, so the most privileged row is never buried.
      order: [['accessType', 'DESC'], ['roleGrantedAt', 'ASC']],
    });
  };

  User.getOfficers = function () {
    return this.findAll({
      where: { accessType: 'OFFICER' },
      order: [['roleGrantedAt', 'ASC'], ['lastName', 'ASC']],
    });
  };

  /**
   * Paginated, searchable roster backing the Control Panel's Users table.
   *
   * @param {object} opts {search, searchEmail, role, committee, offset, limit}
   * @returns {Promise<{rows: User[], count: number}>}
   */
  User.getRoster = function (opts = {}) {
    const where = {};

    if (opts.search) {
      const term = `%${opts.search}%`;
      const matchers = [
        { firstName: { [Sequelize.Op.iLike]: term } },
        { lastName: { [Sequelize.Op.iLike]: term } },
      ];
      // Searching by email is admin-only. Without this, an officer could recover a redacted
      // address by probing the search box one substring at a time.
      if (opts.searchEmail) matchers.push({ email: { [Sequelize.Op.iLike]: term } });
      where[Sequelize.Op.or] = matchers;
    }

    if (opts.role === 'Admin') where.accessType = { [Sequelize.Op.or]: ['ADMIN', 'SUPERADMIN'] };
    else if (opts.role === 'Officer') where.accessType = 'OFFICER';
    else if (opts.role === 'Member') where.accessType = { [Sequelize.Op.or]: ['STANDARD', 'RESTRICTED'] };

    if (opts.committee) {
      where.committees = { [Sequelize.Op.contains]: [opts.committee] };
    }

    return this.findAndCountAll({
      where,
      offset: opts.offset || 0,
      limit: opts.limit || 25,
      // Elevated users first, then most points, so the table opens on the interesting rows.
      order: [['accessType', 'DESC'], ['points', 'DESC'], ['lastName', 'ASC']],
    });
  };

  User.prototype.addPoints = function (points) {
    return this.increment({ points });
  };

  User.prototype.getBaseProfile = function () {
    return {
      id: this.getDataValue('uuid'),
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
      isProfilePublic: this.getDataValue('isProfilePublic'),
      isOfficer: this.isOfficer(),
      committees: this.getDataValue('committees') || [],
    };
  };

  /**
   * The label shown in the Admins table's "Level" column. Super admin is derived from
   * accessType so it can never disagree with the actual privilege; everything else falls
   * back to 'President', which is what a committee admin is.
   */
  User.prototype.getAdminLevel = function () {
    if (this.isSuperAdmin()) return 'Super admin';
    return this.getDataValue('position') || 'President';
  };

  /**
   * The row shape used by the Control Panel roster tables. Only ever returned from admin- or
   * officer-scoped endpoints, never a public one.
   *
   * @param {object} opts {sensitive} — when false, contact details and role-grant metadata are
   *   omitted entirely rather than sent and hidden client-side. Officers get this for members
   *   outside their own committees.
   */
  User.prototype.getRosterProfile = function ({ sensitive = true } = {}) {
    let role = 'Member';
    if (this.isAdmin()) role = 'Admin';
    else if (this.isOfficer()) role = 'Officer';

    if (!sensitive) {
      return {
        uuid: this.getDataValue('uuid'),
        firstName: this.getDataValue('firstName'),
        lastName: this.getDataValue('lastName'),
        picture: this.getDataValue('picture'),
        email: null,
        role,
        accessType: this.getDataValue('accessType'),
        level: this.isAdmin() ? this.getAdminLevel() : null,
        position: this.getDataValue('position') || (this.isOfficer() ? 'Officer' : null),
        committees: this.getDataValue('committees') || [],
        year: this.getDataValue('year'),
        major: this.getDataValue('major'),
        points: this.getDataValue('points'),
        state: this.getDataValue('state'),
        roleGrantedBy: null,
        roleGrantedAt: null,
        joinedAt: this.getDataValue('createdAt'),
        lastActiveAt: null,
        redacted: true,
      };
    }

    return {
      uuid: this.getDataValue('uuid'),
      firstName: this.getDataValue('firstName'),
      lastName: this.getDataValue('lastName'),
      picture: this.getDataValue('picture'),
      email: this.getDataValue('email'),
      role,
      accessType: this.getDataValue('accessType'),
      level: this.isAdmin() ? this.getAdminLevel() : null,
      position: this.getDataValue('position') || (this.isOfficer() ? 'Officer' : null),
      committees: this.getDataValue('committees') || [],
      year: this.getDataValue('year'),
      major: this.getDataValue('major'),
      points: this.getDataValue('points'),
      state: this.getDataValue('state'),
      roleGrantedBy: this.getDataValue('roleGrantedBy'),
      roleGrantedAt: this.getDataValue('roleGrantedAt'),
      joinedAt: this.getDataValue('createdAt'),
      lastActiveAt: this.getDataValue('lastActiveAt') || this.getDataValue('lastLogin'),
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

  User.prototype.isOfficer = function () {
    return this.getDataValue('accessType') === 'OFFICER';
  };

  User.prototype.hasCommittee = function (committee) {
    const committees = this.getDataValue('committees') || [];
    return committees.includes(committee);
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
