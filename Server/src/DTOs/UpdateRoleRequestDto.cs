using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public sealed record UpdateRoleRequestDto(
    [Required, RegularExpression("^(viewer|operator|engineer|admin)$")]
    string Role);
