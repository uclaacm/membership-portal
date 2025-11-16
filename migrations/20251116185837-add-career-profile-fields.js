/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adding new columns to the users table
    await queryInterface.addColumn('user', 'bio', {
      type: Sequelize.TEXT,
      validate: {
        len: [0, 1000],
      },
    });

    await queryInterface.addColumn('user', 'linkedinUrl', {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    });

    await queryInterface.addColumn('user', 'githubUrl', {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    });

    await queryInterface.addColumn('user', 'portfolioUrl', {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    });

    await queryInterface.addColumn('user', 'personalWebsite', {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    });

    await queryInterface.addColumn('user', 'resumeUrl', {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    });

    await queryInterface.addColumn('user', 'skills', {
      type: Sequelize.JSONB,
      defaultValue: [],
    });

    await queryInterface.addColumn('user', 'isProfilePublic', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('user', 'pronouns', {
      type: Sequelize.STRING,
    });

    // Adding an index for isProfilePublic
    await queryInterface.addIndex('user', ['isProfilePublic']);
  },

  async down(queryInterface) {
    // Removing the added columns
    await queryInterface.removeColumn('user', 'bio');
    await queryInterface.removeColumn('user', 'linkedinUrl');
    await queryInterface.removeColumn('user', 'githubUrl');
    await queryInterface.removeColumn('user', 'portfolioUrl');
    await queryInterface.removeColumn('user', 'personalWebsite');
    await queryInterface.removeColumn('user', 'resumeUrl');
    await queryInterface.removeColumn('user', 'skills');
    await queryInterface.removeColumn('user', 'isProfilePublic');
    await queryInterface.removeColumn('user', 'pronouns');

    // Removing the index for isProfilePublic
    await queryInterface.removeIndex('user', ['isProfilePublic']);
  },
};
