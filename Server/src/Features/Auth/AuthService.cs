using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Extensions;
using Server.Interfaces;
using Server.Models;
using Server.Security;

namespace Server.Features.Auth;

public sealed class AuthService(
    IUnitOfWork unitOfWork,
    IPasswordHasher<UserModel> passwordHasher,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthResult<AuthSession>> RegisterAsync(
        RegisterRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (await unitOfWork.Users.EmailExistsAsync(email, cancellationToken))
        {
            return AuthResult<AuthSession>.Conflict("Email is already registered.");
        }

        var user = new UserModel
        {
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = string.Empty,
            Role = UserRolesSecurity.Viewer
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        var response = IssueAuthResponse(user, out var refreshToken);
        unitOfWork.Users.Add(user);
        unitOfWork.RefreshTokens.Add(refreshToken);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.IsUniqueViolation("IX_Users_Email"))
        {
            return AuthResult<AuthSession>.Conflict("Email is already registered.");
        }

        return AuthResult<AuthSession>.Success(response);
    }

    public async Task<AuthResult<AuthSession>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(
            NormalizeEmail(request.Email),
            cancellationToken);

        if (user is null)
        {
            return AuthResult<AuthSession>.Unauthorized("Invalid email or password.");
        }

        var passwordResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return AuthResult<AuthSession>.Unauthorized("Invalid email or password.");
        }

        if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        }

        var response = IssueAuthResponse(user, out var refreshToken);
        unitOfWork.RefreshTokens.Add(refreshToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return AuthResult<AuthSession>.Success(response);
    }

    public async Task<AuthResult<AuthSession>> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var tokenHash = tokenService.HashRefreshToken(refreshToken);
        var currentToken = await unitOfWork.RefreshTokens.GetByHashAsync(
            tokenHash,
            cancellationToken);

        if (currentToken is null || !currentToken.IsActive)
        {
            return AuthResult<AuthSession>.Unauthorized(
                "Invalid or expired refresh token.");
        }

        currentToken.RevokedAt = DateTimeOffset.UtcNow;
        var response = IssueAuthResponse(currentToken.User, out var newRefreshToken);
        unitOfWork.RefreshTokens.Add(newRefreshToken);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return AuthResult<AuthSession>.Unauthorized(
                "Invalid or expired refresh token.");
        }

        return AuthResult<AuthSession>.Success(response);
    }

    public async Task LogoutAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var tokenHash = tokenService.HashRefreshToken(refreshToken);
        var storedToken = await unitOfWork.RefreshTokens.GetByHashAsync(
            tokenHash,
            cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null)
        {
            return;
        }

        storedToken.RevokedAt = DateTimeOffset.UtcNow;

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Logout is idempotent; another request already revoked the token.
        }
    }

    public async Task<UserResponseDto?> GetCurrentUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        return user is null ? null : ToUserResponse(user);
    }

    private AuthSession IssueAuthResponse(
        UserModel user,
        out RefreshTokenModel refreshToken)
    {
        var tokens = tokenService.IssueTokens(user);
        refreshToken = new RefreshTokenModel
        {
            TokenHash = tokens.RefreshTokenHash,
            ExpiresAt = tokens.RefreshTokenExpiresAt,
            UserId = user.Id,
            User = user
        };

        return new AuthSession(
            new AuthResponseDto(
                "Bearer",
                tokens.AccessToken,
                tokens.AccessTokenExpiresAt,
                tokens.RefreshTokenExpiresAt,
                ToUserResponse(user)),
            tokens.RefreshToken,
            tokens.RefreshTokenExpiresAt);
    }

    private static UserResponseDto ToUserResponse(UserModel user) =>
        new(user.Id, user.Email, user.DisplayName, user.CreatedAt, user.Role);

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();
}
