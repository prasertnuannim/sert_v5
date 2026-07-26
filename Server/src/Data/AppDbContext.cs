using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<AccessRole> Roles => Set<AccessRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var user = modelBuilder.Entity<User>();
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

        var role = modelBuilder.Entity<AccessRole>();
        role.ToTable("Roles");
        role.HasKey(x => x.Name);
        role.Property(x => x.Name).HasMaxLength(32);
        role.Property(x => x.DisplayName).HasMaxLength(64);
        role.Property(x => x.Description).HasMaxLength(300);

        var refreshToken = modelBuilder.Entity<RefreshToken>();
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
