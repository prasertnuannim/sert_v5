using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Server.Data;
using Server.DTOs;
using Server.Features.Auth;
using Server.Interfaces;
using Server.Models;
using Server.Options;
using Server.Repositories;
using Server.Services;
using Xunit;

namespace Server.Tests.Auth;

public sealed class AuthServiceIntegrationTests
{
    [Fact]
    public async Task RegisterLoginRefreshAndLogout_FollowTokenLifecycle()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var registration = await service.RegisterAsync(
            new RegisterRequestDto("person@example.com", "Password123!", "Person"));

        Assert.Equal(AuthResultStatus.Success, registration.Status);
        Assert.NotNull(registration.Value);
        Assert.Equal("person@example.com", registration.Value.Response.User.Email);

        var login = await service.LoginAsync(
            new LoginRequestDto("PERSON@example.com", "Password123!"));

        Assert.Equal(AuthResultStatus.Success, login.Status);
        Assert.NotNull(login.Value);

        var refresh = await service.RefreshAsync(login.Value.RefreshToken);

        Assert.Equal(AuthResultStatus.Success, refresh.Status);
        Assert.NotNull(refresh.Value);
        Assert.NotEqual(login.Value.RefreshToken, refresh.Value.RefreshToken);

        var reusedToken = await service.RefreshAsync(login.Value.RefreshToken);
        Assert.Equal(AuthResultStatus.Unauthorized, reusedToken.Status);

        await service.LogoutAsync(refresh.Value.RefreshToken);

        var loggedOutToken = await service.RefreshAsync(refresh.Value.RefreshToken);
        Assert.Equal(AuthResultStatus.Unauthorized, loggedOutToken.Status);
    }

    [Fact]
    public async Task Login_WithWrongPassword_DoesNotIssueRefreshToken()
    {
        await using var context = CreateContext();
        var service = CreateService(context);
        await service.RegisterAsync(
            new RegisterRequestDto("person@example.com", "Password123!", "Person"));
        var tokenCount = await context.RefreshTokens.CountAsync();

        var result = await service.LoginAsync(
            new LoginRequestDto("person@example.com", "incorrect"));

        Assert.Equal(AuthResultStatus.Unauthorized, result.Status);
        Assert.Equal(tokenCount, await context.RefreshTokens.CountAsync());
    }

    [Fact]
    public async Task Register_WithExistingNormalizedEmail_ReturnsConflict()
    {
        await using var context = CreateContext();
        var service = CreateService(context);
        await service.RegisterAsync(
            new RegisterRequestDto("person@example.com", "Password123!", "Person"));

        var duplicate = await service.RegisterAsync(
            new RegisterRequestDto(" PERSON@EXAMPLE.COM ", "Password123!", "Other"));

        Assert.Equal(AuthResultStatus.Conflict, duplicate.Status);
        Assert.Single(await context.Users.ToListAsync());
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IAuthService CreateService(AppDbContext context)
    {
        var users = new UserRepository(context);
        var refreshTokens = new RefreshTokenRepository(context);
        var unitOfWork = new UnitOfWorkRepository(context, users, refreshTokens);
        var passwordHasher = new PasswordHasher<UserModel>();
        var tokenService = new TokenService(Microsoft.Extensions.Options.Options.Create(new JwtOptions
        {
            Issuer = "tests",
            Audience = "tests",
            Key = "integration-test-key-at-least-32-bytes-long",
            AccessTokenMinutes = 15,
            RefreshTokenDays = 7
        }));

        return new AuthService(unitOfWork, passwordHasher, tokenService);
    }
}
