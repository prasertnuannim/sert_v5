using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DTOs;
using Server.Interfaces;
using Server.Models;
using Server.Security;

namespace Server.Controllers;

[ApiController]
[Authorize(Policy = AccessPolicies.UserAdministration)]
[Route("api/users")]
public sealed class UsersController(
    IUnitOfWork unitOfWork,
    IPasswordHasher<User> passwordHasher) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<UserResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await unitOfWork.Users.EmailExistsAsync(email, cancellationToken))
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: "Email is already registered.");
        }

        var role = UserRoles.Normalize(request.Role);
        var user = new User
        {
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = string.Empty,
            Role = role
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        unitOfWork.Users.Add(user);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: "Email is already registered.");
        }

        return Created($"/api/users/{user.Id}", ToResponse(user));
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<UserResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var users = await unitOfWork.Users.GetAllAsync(cancellationToken);
        return Ok(users.Select(ToResponse));
    }

    [HttpPut("{userId:guid}")]
    [ProducesResponseType<UserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        Guid userId,
        UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var role = UserRoles.Normalize(request.Role);
        if (Guid.TryParse(User.FindFirstValue("sub"), out var currentUserId) &&
            currentUserId == userId &&
            role != UserRoles.Admin)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Role change rejected",
                detail: "Administrators cannot remove their own admin access.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase) &&
            await unitOfWork.Users.EmailExistsAsync(email, cancellationToken))
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: "Email is already registered.");
        }

        user.Email = email;
        user.DisplayName = request.DisplayName.Trim();
        user.Role = role;

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: "Email is already registered.");
        }

        return Ok(ToResponse(user));
    }

    [HttpPatch("{userId:guid}/role")]
    [ProducesResponseType<UserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRole(
        Guid userId,
        UpdateRoleRequest request,
        CancellationToken cancellationToken)
    {
        var role = UserRoles.Normalize(request.Role);
        if (!UserRoles.IsValid(role))
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid role",
                detail: "Role must be viewer, operator, engineer, or admin.");
        }

        if (Guid.TryParse(User.FindFirstValue("sub"), out var currentUserId) &&
            currentUserId == userId &&
            role != UserRoles.Admin)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Role change rejected",
                detail: "Administrators cannot remove their own admin access.");
        }

        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        user.Role = role;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(user));
    }

    [HttpDelete("{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (Guid.TryParse(User.FindFirstValue("sub"), out var currentUserId) &&
            currentUserId == userId)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Account deletion rejected",
                detail: "Administrators cannot delete their own account.");
        }

        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        unitOfWork.Users.Remove(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static UserResponse ToResponse(User user) =>
        new(
            user.Id,
            user.Email,
            user.DisplayName,
            user.CreatedAt,
            user.Role);
}
