/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Append-only audit trail of privileged actions. No updatedAt: rows are never modified.
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "auditLogs" (
        "id"         SERIAL PRIMARY KEY,
        -- No DB-side default: Sequelize generates the UUIDV4 in JS, and gen_random_uuid()
        -- needs the pgcrypto extension on the Postgres 9.6 image used in dev.
        "uuid"       UUID NOT NULL,
        "actor"      UUID,
        "actorName"  VARCHAR(255),
        "actorEmail" VARCHAR(255),
        "action"     VARCHAR(255) NOT NULL,
        "target"     VARCHAR(255),
        "detail"     VARCHAR(255),
        "committee"  VARCHAR(255),
        "ip"         VARCHAR(255),
        "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Named to match what Sequelize's db.sync() generates for the model's unique uuid index.
      -- This app runs sync() *and* migrations, so a differently-named index here would leave
      -- two identical unique indexes on the same column.
      CREATE UNIQUE INDEX IF NOT EXISTS "audit_logs_uuid" ON "auditLogs" ("uuid");
      CREATE INDEX IF NOT EXISTS "audit_created_at_index" ON "auditLogs" ("createdAt");
      CREATE INDEX IF NOT EXISTS "audit_action_index" ON "auditLogs" ("action");
      CREATE INDEX IF NOT EXISTS "audit_actor_index" ON "auditLogs" ("actor");
    `);

    // Role metadata backing the Admins and Officers tables in the Control Panel.
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "position"      VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "roleGrantedBy" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "roleGrantedAt" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "lastActiveAt"  TIMESTAMP WITH TIME ZONE;
    `);

    // Seed lastActiveAt from the existing lastLogin so the column is not uniformly null on the
    // first render of the Users table.
    await queryInterface.sequelize.query(`
      UPDATE "users" SET "lastActiveAt" = "lastLogin" WHERE "lastActiveAt" IS NULL;
    `);

    // Existing elevated users predate the audit trail; date their grant from account creation
    // so "Granted on" is never blank for them.
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET "roleGrantedAt" = "createdAt"
      WHERE "roleGrantedAt" IS NULL
        AND "accessType" IN ('OFFICER', 'ADMIN', 'SUPERADMIN');
    `);

    // Dimensions and the derived reference count let the Media grid mark files as unused.
    await queryInterface.sequelize.query(`
      ALTER TABLE "images"
        ADD COLUMN IF NOT EXISTS "width"  INTEGER,
        ADD COLUMN IF NOT EXISTS "height" INTEGER;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "images"
        DROP COLUMN IF EXISTS "width",
        DROP COLUMN IF EXISTS "height";

      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "position",
        DROP COLUMN IF EXISTS "roleGrantedBy",
        DROP COLUMN IF EXISTS "roleGrantedAt",
        DROP COLUMN IF EXISTS "lastActiveAt";

      DROP TABLE IF EXISTS "auditLogs";
    `);
  },
};
