using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Interfaces;
using Server.Models;
using Server.Security;

namespace Server.Features.Auth;

public sealed class AuthService(
    IUnitOfWork unitOfWork,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthResult<AuthResponse>> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (await unitOfWork.Users.EmailExistsAsync(email, cancellationToken))
        {
            return AuthResult<AuthResponse>.Conflict("Email is already registered.");
        }

        var user = new User
        {
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = string.Empty,
            Role = UserRoles.Normalize(request.Role)
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        var response = IssueAuthResponse(user, out var refreshToken);
        unitOfWork.Users.Add(user);
        unitOfWork.RefreshTokens.Add(refreshToken);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return AuthResult<AuthResponse>.Conflict("Email is already registered.");
        }

        return AuthResult<AuthResponse>.Success(response);
    }

    public async Task<AuthResult<AuthResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(
            NormalizeEmail(request.Email),
            cancellationToken);

        if (user is null)
        {
            return AuthResult<AuthResponse>.Unauthorized("Invalid email or password.");
        }

        var passwordResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return AuthResult<AuthResponse>.Unauthorized("Invalid email or password.");
        }

        if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        }

        var response = IssueAuthResponse(user, out var refreshToken);
        unitOfWork.RefreshTokens.Add(refreshToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return AuthResult<AuthResponse>.Success(response);
    }

    public async Task<AuthResult<AuthResponse>> RefreshAsync(
        RefreshRequest request,
        CancellationToken cancellationToken = default)
    {
        var tokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var currentToken = await unitOfWork.RefreshTokens.GetByHashAsync(
            tokenHash,
            cancellationToken);

        if (currentToken is null || !currentToken.IsActive)
        {
            return AuthResult<AuthResponse>.Unauthorized(
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
            return AuthResult<AuthResponse>.Unauthorized(
                "Invalid or expired refresh token.");
        }

        return AuthResult<AuthResponse>.Success(response);
    }

    public async Task LogoutAsync(
        LogoutRequest request,
        CancellationToken cancellationToken = default)
    {
        var tokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var refreshToken = await unitOfWork.RefreshTokens.GetByHashAsync(
            tokenHash,
            cancellationToken);

        if (refreshToken is null || refreshToken.RevokedAt is not null)
        {
            return;
        }

        refreshToken.RevokedAt = DateTimeOffset.UtcNow;

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Logout is idempotent; another request already revoked the token.
        }
    }

    public async Task<UserResponse?> GetCurrentUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        return user is null ? null : ToUserResponse(user);
    }

    private AuthResponse IssueAuthResponse(
        User user,
        out RefreshToken refreshToken)
    {
        var tokens = tokenService.IssueTokens(user);
        refreshToken = new RefreshToken
        {
            TokenHash = tokens.RefreshTokenHash,
            ExpiresAt = tokens.RefreshTokenExpiresAt,
            UserId = user.Id,
            User = user
        };

        return new AuthResponse(
            "Bearer",
            tokens.AccessToken,
            tokens.AccessTokenExpiresAt,
            tokens.RefreshToken,
            tokens.RefreshTokenExpiresAt,
            ToUserResponse(user));
    }

    private static UserResponse ToUserResponse(User user) =>
        new(user.Id, user.Email, user.DisplayName, user.CreatedAt, user.Role);

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();
}
