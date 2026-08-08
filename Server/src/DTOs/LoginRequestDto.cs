using System.ComponentModel.DataAnnotations;

namespace Server.DTOs;

public sealed record LoginRequestDto(
    [Required, EmailAddress, StringLength(320)] string Email,
    [Required, StringLength(128, MinimumLength = 1)] string Password);
