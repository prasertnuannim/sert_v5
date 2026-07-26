using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Server.Models;
using Server.Security;
using Server.Services;

namespace Server.Data;

public sealed class DatabaseSeeder(
    AppDbContext db,
    IPasswordHasher<User> passwordHasher,
    IOptions<DefaultUserOptions> options,
    ILogger<DatabaseSeeder> logger)
{
    private readonly DefaultUserOptions _options = options.Value;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        ValidateOptions();

        var email = _options.Email.Trim().ToLowerInvariant();
        var existingUser = await db.Users.SingleOrDefaultAsync(
            x => x.Email == email,
            cancellationToken);
        if (existingUser is not null)
        {
            if (existingUser.Role != UserRoles.Admin)
            {
                existingUser.Role = UserRoles.Admin;
                await db.SaveChangesAsync(cancellationToken);
            }

            return;
        }

        var user = new User
        {
            Email = email,
            DisplayName = _options.DisplayName.Trim(),
            PasswordHash = string.Empty,
            Role = UserRoles.Admin
        };
        user.PasswordHash = passwordHasher.HashPassword(user, _options.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Created development default user {Email}.", email);
    }

    private void ValidateOptions()
    {
        if (string.IsNullOrWhiteSpace(_options.Email) ||
            string.IsNullOrWhiteSpace(_options.DisplayName) ||
            _options.Password.Length is < 8 or > 128)
        {
            throw new InvalidOperationException(
                "Enabled DefaultUser configuration requires an email, display name, and password between 8 and 128 characters.");
        }
    }
}
