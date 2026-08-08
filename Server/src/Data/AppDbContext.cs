using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Security;

namespace Server.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<UserModel> Users => Set<UserModel>();
    public DbSet<AccessRoleModel> Roles => Set<AccessRoleModel>();
    public DbSet<RefreshTokenModel> RefreshTokens => Set<RefreshTokenModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var user = modelBuilder.Entity<UserModel>();
        user.HasKey(x => x.Id);
        user.HasIndex(x => x.Email).IsUnique();
        user.Property(x => x.Email).HasMaxLength(320);
        user.Property(x => x.DisplayName).HasMaxLength(100);
        user.Property(x => x.PasswordHash).HasMaxLength(500);
        user.Property(x => x.Role).HasMaxLength(32);
        user
            .HasOne(x => x.RoleDefinition)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.Role)
            .HasPrincipalKey(x => x.Name)
            .OnDelete(DeleteBehavior.Restrict);

        var role = modelBuilder.Entity<AccessRoleModel>();
        role.ToTable("Roles");
        role.HasKey(x => x.Name);
        role.Property(x => x.Name).HasMaxLength(32);
        role.Property(x => x.DisplayName).HasMaxLength(64);
        role.Property(x => x.Description).HasMaxLength(300);
        role.HasData(
            new AccessRoleModel
            {
                Name = UserRolesSecurity.Viewer,
                DisplayName = "Viewer",
                Description = "ดูข้อมูลอุปกรณ์และสถานะระบบ",
                Level = 10
            },
            new AccessRoleModel
            {
                Name = UserRolesSecurity.Operator,
                DisplayName = "Operator",
                Description = "ดูและควบคุมอุปกรณ์",
                Level = 20
            },
            new AccessRoleModel
            {
                Name = UserRolesSecurity.Engineer,
                DisplayName = "Engineer",
                Description = "จัดการอุปกรณ์และ Automation workflow",
                Level = 30
            },
            new AccessRoleModel
            {
                Name = UserRolesSecurity.Admin,
                DisplayName = "Administrator",
                Description = "จัดการบัญชี บทบาท และสิทธิ์ทั้งหมด",
                Level = 100
            });

        var refreshToken = modelBuilder.Entity<RefreshTokenModel>();
        refreshToken.HasKey(x => x.Id);
        refreshToken.HasIndex(x => x.TokenHash).IsUnique();
        refreshToken.Property(x => x.TokenHash).HasMaxLength(64);
        refreshToken.Property(x => x.RevokedAt).IsConcurrencyToken();
        refreshToken
            .HasOne(x => x.User)
            .WithMany(x => x.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
