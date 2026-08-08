using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Security;

namespace Server.Features.Users;

[ApiController]
[Authorize(Policy = AccessPoliciesSecurity.UserAdministration)]
[Route("api/users")]
public sealed class UsersController(UserAdministrationService users) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<UserResponseDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        CreateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await users.CreateAsync(request, cancellationToken);
        return result.Status switch
        {
            UserAdminResultStatus.Success => CreatedAtAction(
                nameof(GetById),
                new { userId = result.Value!.Id },
                result.Value),
            UserAdminResultStatus.Conflict => ConflictProblem(result.Error!),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<UserResponseDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await users.GetAllAsync(cancellationToken));

    [HttpGet("{userId:guid}")]
    [ProducesResponseType<UserResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await users.GetByIdAsync(userId, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPut("{userId:guid}")]
    [ProducesResponseType<UserResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        Guid userId,
        UpdateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await users.UpdateAsync(
            userId,
            CurrentUserId(),
            request,
            cancellationToken);
        return ToActionResult(result, "Role change rejected");
    }

    [HttpPatch("{userId:guid}/role")]
    [ProducesResponseType<UserResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRole(
        Guid userId,
        UpdateRoleRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await users.UpdateRoleAsync(
            userId,
            CurrentUserId(),
            request.Role,
            cancellationToken);
        return ToActionResult(result, "Invalid role or role change rejected");
    }

    [HttpDelete("{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await users.DeleteAsync(
            userId,
            CurrentUserId(),
            cancellationToken);
        return result.Status switch
        {
            UserAdminResultStatus.Success => NoContent(),
            UserAdminResultStatus.NotFound => NotFound(),
            UserAdminResultStatus.Rejected => BadRequestProblem(
                "Account deletion rejected",
                result.Error!),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    private IActionResult ToActionResult(
        UserAdminResult<UserResponseDto> result,
        string rejectionTitle) =>
        result.Status switch
        {
            UserAdminResultStatus.Success => Ok(result.Value),
            UserAdminResultStatus.NotFound => NotFound(),
            UserAdminResultStatus.Conflict => ConflictProblem(result.Error!),
            UserAdminResultStatus.Rejected => BadRequestProblem(
                rejectionTitle,
                result.Error!),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };

    private Guid? CurrentUserId() =>
        Guid.TryParse(User.FindFirstValue("sub"), out var userId) ? userId : null;

    private ObjectResult ConflictProblem(string detail) =>
        Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Conflict",
            detail: detail);

    private ObjectResult BadRequestProblem(string title, string detail) =>
        Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: title,
            detail: detail);
}
