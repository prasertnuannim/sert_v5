using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Extensions;
using Server.Interfaces;
using Server.Models;
using Server.Security;

namespace Server.Features.Users;

public sealed class UserAdministrationService(
    IUnitOfWork unitOfWork,
    IPasswordHasher<UserModel> passwordHasher)
{
    public async Task<UserAdminResult<UserResponseDto>> CreateAsync(
        CreateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        if (await unitOfWork.Users.EmailExistsAsync(email, cancellationToken))
        {
            return UserAdminResult<UserResponseDto>.Conflict("Email is already registered.");
        }

        var user = new UserModel
        {
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = string.Empty,
            Role = UserRolesSecurity.Normalize(request.Role)
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        unitOfWork.Users.Add(user);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.IsUniqueViolation("IX_Users_Email"))
        {
            return UserAdminResult<UserResponseDto>.Conflict("Email is already registered.");
        }

        return UserAdminResult<UserResponseDto>.Success(ToResponse(user));
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetAllAsync(
        CancellationToken cancellationToken) =>
        (await unitOfWork.Users.GetAllAsync(cancellationToken))
            .Select(ToResponse)
            .ToList();

    public async Task<UserResponseDto?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        return user is null ? null : ToResponse(user);
    }

    public async Task<UserAdminResult<UserResponseDto>> UpdateAsync(
        Guid userId,
        Guid? currentUserId,
        UpdateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return UserAdminResult<UserResponseDto>.NotFound();
        }

        var role = UserRolesSecurity.Normalize(request.Role);
        if (currentUserId == userId && role != UserRolesSecurity.Admin)
        {
            return UserAdminResult<UserResponseDto>.Rejected(
                "Administrators cannot remove their own admin access.");
        }

        var email = NormalizeEmail(request.Email);
        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase) &&
            await unitOfWork.Users.EmailExistsAsync(email, cancellationToken))
        {
            return UserAdminResult<UserResponseDto>.Conflict("Email is already registered.");
        }

        user.Email = email;
        user.DisplayName = request.DisplayName.Trim();
        user.Role = role;

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.IsUniqueViolation("IX_Users_Email"))
        {
            return UserAdminResult<UserResponseDto>.Conflict("Email is already registered.");
        }

        return UserAdminResult<UserResponseDto>.Success(ToResponse(user));
    }

    public async Task<UserAdminResult<UserResponseDto>> UpdateRoleAsync(
        Guid userId,
        Guid? currentUserId,
        string requestedRole,
        CancellationToken cancellationToken)
    {
        var role = UserRolesSecurity.Normalize(requestedRole);
        if (!UserRolesSecurity.IsValid(role))
        {
            return UserAdminResult<UserResponseDto>.Rejected(
                "Role must be viewer, operator, engineer, or admin.");
        }

        if (currentUserId == userId && role != UserRolesSecurity.Admin)
        {
            return UserAdminResult<UserResponseDto>.Rejected(
                "Administrators cannot remove their own admin access.");
        }

        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return UserAdminResult<UserResponseDto>.NotFound();
        }

        user.Role = role;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return UserAdminResult<UserResponseDto>.Success(ToResponse(user));
    }

    public async Task<UserAdminResult<bool>> DeleteAsync(
        Guid userId,
        Guid? currentUserId,
        CancellationToken cancellationToken)
    {
        if (currentUserId == userId)
        {
            return UserAdminResult<bool>.Rejected(
                "Administrators cannot delete their own account.");
        }

        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return UserAdminResult<bool>.NotFound();
        }

        unitOfWork.Users.Remove(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return UserAdminResult<bool>.Success(true);
    }

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static UserResponseDto ToResponse(UserModel user) =>
        new(user.Id, user.Email, user.DisplayName, user.CreatedAt, user.Role);
}

public enum UserAdminResultStatus
{
    Success,
    NotFound,
    Conflict,
    Rejected
}

public sealed record UserAdminResult<T>(
    UserAdminResultStatus Status,
    T? Value = default,
    string? Error = null)
{
    public static UserAdminResult<T> Success(T value) =>
        new(UserAdminResultStatus.Success, value);

    public static UserAdminResult<T> NotFound() =>
        new(UserAdminResultStatus.NotFound);

    public static UserAdminResult<T> Conflict(string error) =>
        new(UserAdminResultStatus.Conflict, Error: error);

    public static UserAdminResult<T> Rejected(string error) =>
        new(UserAdminResultStatus.Rejected, Error: error);
}
