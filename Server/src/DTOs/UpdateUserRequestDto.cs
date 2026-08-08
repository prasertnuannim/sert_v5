using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public sealed record UpdateUserRequestDto(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    [Required, RegularExpression("^(viewer|operator|engineer|admin)$")]
    string Role);
