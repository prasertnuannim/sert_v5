using System.ComponentModel.DataAnnotations;
using Server.Security;

namespace Server.DTOs;

public sealed record CreateUserRequestDto(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required, StringLength(128, MinimumLength = 8)] string Password,
    [Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    [Required, RegularExpression("^(viewer|operator|engineer|admin)$")]
    string Role = UserRolesSecurity.Viewer);
