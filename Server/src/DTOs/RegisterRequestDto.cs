using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public sealed record RegisterRequestDto(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required, StringLength(128, MinimumLength = 8)] string Password,
    [Required, StringLength(100, MinimumLength = 1)] string DisplayName);
