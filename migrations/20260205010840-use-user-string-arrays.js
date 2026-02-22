/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Transform skills column
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN skills_temp text[];
      
      UPDATE users
      SET skills_temp = ARRAY(SELECT jsonb_array_elements_text(skills));
      
      ALTER TABLE users DROP COLUMN skills;
      ALTER TABLE users RENAME COLUMN skills_temp TO skills;
      ALTER TABLE users
        ALTER COLUMN skills SET DEFAULT '{}',
        ALTER COLUMN skills SET NOT NULL;
    `);

    // Transform careerInterests column
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN "careerInterests_temp" text[];
      
      UPDATE users
      SET "careerInterests_temp" = ARRAY(SELECT jsonb_array_elements_text("careerInterests"));
      
      ALTER TABLE users DROP COLUMN "careerInterests";
      ALTER TABLE users RENAME COLUMN "careerInterests_temp" TO "careerInterests";
      ALTER TABLE users
        ALTER COLUMN "careerInterests" SET DEFAULT '{}',
        ALTER COLUMN "careerInterests" SET NOT NULL;
    `);
  },

  async down(queryInterface) {
    // Revert skills column
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN skills_temp JSONB;
      
      UPDATE users
      SET skills_temp = to_jsonb(skills);
      
      ALTER TABLE users DROP COLUMN skills;
      ALTER TABLE users RENAME COLUMN skills_temp TO skills;
      ALTER TABLE users
        ALTER COLUMN skills SET DEFAULT '[]'::JSONB,
        ALTER COLUMN skills SET NOT NULL;
    `);

    // Revert careerInterests column
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN "careerInterests_temp" JSONB;
      
      UPDATE users
      SET "careerInterests_temp" = to_jsonb("careerInterests");
      
      ALTER TABLE users DROP COLUMN "careerInterests";
      ALTER TABLE users RENAME COLUMN "careerInterests_temp" TO "careerInterests";
      ALTER TABLE users
        ALTER COLUMN "careerInterests" SET DEFAULT '[]'::JSONB,
        ALTER COLUMN "careerInterests" SET NOT NULL;
    `);
  },
};
