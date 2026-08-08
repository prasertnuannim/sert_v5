using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Data.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // This also baselines databases created by the old EnsureCreated path.
        // All operations preserve existing users and refresh tokens.
        migrationBuilder.Sql(
            """
            CREATE TABLE IF NOT EXISTS "Roles" (
                "Name" character varying(32) NOT NULL,
                "DisplayName" character varying(64) NOT NULL,
                "Description" character varying(300) NOT NULL,
                "Level" integer NOT NULL,
                CONSTRAINT "PK_Roles" PRIMARY KEY ("Name")
            );

            INSERT INTO "Roles" ("Name", "DisplayName", "Description", "Level")
            VALUES
                ('viewer', 'Viewer', 'ดูข้อมูลอุปกรณ์และสถานะระบบ', 10),
                ('operator', 'Operator', 'ดูและควบคุมอุปกรณ์', 20),
                ('engineer', 'Engineer', 'จัดการอุปกรณ์และ Automation workflow', 30),
                ('admin', 'Administrator', 'จัดการบัญชี บทบาท และสิทธิ์ทั้งหมด', 100)
            ON CONFLICT ("Name") DO UPDATE SET
                "DisplayName" = EXCLUDED."DisplayName",
                "Description" = EXCLUDED."Description",
                "Level" = EXCLUDED."Level";

            CREATE TABLE IF NOT EXISTS "Users" (
                "Id" uuid NOT NULL,
                "Email" character varying(320) NOT NULL,
                "DisplayName" character varying(100) NOT NULL,
                "PasswordHash" character varying(500) NOT NULL,
                "Role" character varying(32) NOT NULL DEFAULT 'viewer',
                "CreatedAt" timestamp with time zone NOT NULL,
                CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
            );

            ALTER TABLE "Users"
            ADD COLUMN IF NOT EXISTS "Role" character varying(32)
            NOT NULL DEFAULT 'viewer';

            UPDATE "Users"
            SET "Role" = 'viewer'
            WHERE NOT EXISTS (
                SELECT 1 FROM "Roles"
                WHERE "Roles"."Name" = "Users"."Role"
            );

            CREATE TABLE IF NOT EXISTS "RefreshTokens" (
                "Id" uuid NOT NULL,
                "TokenHash" character varying(64) NOT NULL,
                "ExpiresAt" timestamp with time zone NOT NULL,
                "RevokedAt" timestamp with time zone NULL,
                "UserId" uuid NOT NULL,
                "CreatedAt" timestamp with time zone NOT NULL,
                CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id")
            );

            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email"
                ON "Users" ("Email");
            CREATE INDEX IF NOT EXISTS "IX_Users_Role"
                ON "Users" ("Role");
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_RefreshTokens_TokenHash"
                ON "RefreshTokens" ("TokenHash");
            CREATE INDEX IF NOT EXISTS "IX_RefreshTokens_UserId"
                ON "RefreshTokens" ("UserId");

            DO $migration$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'FK_Users_Roles_Role'
                      AND conrelid = '"Users"'::regclass
                ) THEN
                    ALTER TABLE "Users"
                    ADD CONSTRAINT "FK_Users_Roles_Role"
                    FOREIGN KEY ("Role") REFERENCES "Roles" ("Name")
                    ON DELETE RESTRICT;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'FK_RefreshTokens_Users_UserId'
                      AND conrelid = '"RefreshTokens"'::regclass
                ) THEN
                    ALTER TABLE "RefreshTokens"
                    ADD CONSTRAINT "FK_RefreshTokens_Users_UserId"
                    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id")
                    ON DELETE CASCADE;
                END IF;
            END
            $migration$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "RefreshTokens");
        migrationBuilder.DropTable(name: "Users");
        migrationBuilder.DropTable(name: "Roles");
    }
}
