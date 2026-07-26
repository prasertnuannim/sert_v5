using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Middleware;

namespace Server.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApplicationPipeline(this WebApplication app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }
        else
        {
            app.UseHttpsRedirection();
        }

        app.UseCors("Client");
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
            .WithName("HealthCheck");

        return app;
    }

    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "Roles" (
                "Name" character varying(32) NOT NULL,
                "DisplayName" character varying(64) NOT NULL,
                "Description" character varying(300) NOT NULL,
                "Level" integer NOT NULL,
                CONSTRAINT "PK_Roles" PRIMARY KEY ("Name")
            );
            """);
        await db.Database.ExecuteSqlRawAsync(
            """
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
            """);
        await db.Database.ExecuteSqlRawAsync(
            """
            ALTER TABLE "Users"
            ADD COLUMN IF NOT EXISTS "Role" character varying(32)
            NOT NULL DEFAULT 'viewer';
            """);
        await db.Database.ExecuteSqlRawAsync(
            """
            UPDATE "Users"
            SET "Role" = 'viewer'
            WHERE NOT EXISTS (
                SELECT 1
                FROM "Roles"
                WHERE "Roles"."Name" = "Users"."Role"
            );

            UPDATE "Users"
            SET "Role" = 'admin'
            WHERE "Email" = 'admin@sert.local';
            """);
        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE INDEX IF NOT EXISTS "IX_Users_Role"
            ON "Users" ("Role");

            DO $migration$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_Users_Roles_Role'
                ) THEN
                    ALTER TABLE "Users"
                    ADD CONSTRAINT "FK_Users_Roles_Role"
                    FOREIGN KEY ("Role")
                    REFERENCES "Roles" ("Name")
                    ON DELETE RESTRICT;
                END IF;
            END
            $migration$;
            """);

        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        await seeder.SeedAsync();
    }
}
