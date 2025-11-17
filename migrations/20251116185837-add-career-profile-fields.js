/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Adding new columns to the users table
      await queryInterface.addColumn('users', 'bio', {
        type: Sequelize.TEXT,
        validate: {
          len: [0, 1000],
        },
      }, { transaction });

      await queryInterface.addColumn('users', 'linkedinUrl', {
        type: Sequelize.STRING,
        validate: {
          isUrl: true,
        },
      }, { transaction });

      await queryInterface.addColumn('users', 'githubUrl', {
        type: Sequelize.STRING,
        validate: {
          isUrl: true,
        },
      }, { transaction });

      await queryInterface.addColumn('users', 'portfolioUrl', {
        type: Sequelize.STRING,
        validate: {
          isUrl: true,
        },
      }, { transaction });

      await queryInterface.addColumn('users', 'personalWebsite', {
        type: Sequelize.STRING,
        validate: {
          isUrl: true,
        },
      }, { transaction });

      await queryInterface.addColumn('users', 'resumeUrl', {
        type: Sequelize.STRING,
        validate: {
          isUrl: true,
        },
      }, { transaction });

      await queryInterface.addColumn('users', 'skills', {
        type: Sequelize.JSONB,
        defaultValue: [],
      }, { transaction });

      await queryInterface.addColumn('users', 'isProfilePublic', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }, { transaction });

      await queryInterface.addColumn('users', 'pronouns', {
        type: Sequelize.STRING,
      }, { transaction });

      // Adding an index for isProfilePublic
      await queryInterface.addIndex('users', ['isProfilePublic'], { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Removing the added columns
      await queryInterface.removeColumn('users', 'bio', { transaction });
      await queryInterface.removeColumn('users', 'linkedinUrl', { transaction });
      await queryInterface.removeColumn('users', 'githubUrl', { transaction });
      await queryInterface.removeColumn('users', 'portfolioUrl', { transaction });
      await queryInterface.removeColumn('users', 'personalWebsite', { transaction });
      await queryInterface.removeColumn('users', 'resumeUrl', { transaction });
      await queryInterface.removeColumn('users', 'skills', { transaction });
      await queryInterface.removeColumn('users', 'isProfilePublic', { transaction });
      await queryInterface.removeColumn('users', 'pronouns', { transaction });

      // Removing the index for isProfilePublic
      await queryInterface.removeIndex('users', ['isProfilePublic'], { transaction });
    });
  },
};
