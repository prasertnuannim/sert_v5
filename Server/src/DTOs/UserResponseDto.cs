namespace Server.DTOs;

public sealed record UserResponseDto(
    Guid Id,
    string Email,
    string DisplayName,
    DateTimeOffset CreatedAt,
    string Role);
