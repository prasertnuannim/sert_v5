using System.ComponentModel.DataAnnotations;
using Server.Security;

namespace Server.DTOs;

public sealed record RegisterRequest(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required, StringLength(128, MinimumLength = 8)] string Password,
    [Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    [RegularExpression("^(viewer|operator|engineer|admin)$")]
    string Role = UserRoles.Viewer);

public sealed record UpdateRoleRequest(
    [Required, RegularExpression("^(viewer|operator|engineer|admin)$")]
    string Role);

public sealed record UpdateUserRequest(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    [Required, RegularExpression("^(viewer|operator|engineer|admin)$")]
    string Role);

public sealed record LoginRequest(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required] string Password);

public sealed record RefreshRequest(
    [Required] string RefreshToken);

public sealed record LogoutRequest(
    [Required] string RefreshToken);
