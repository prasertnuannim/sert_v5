namespace Server.DTOs;

public sealed record AuthResponseDto(
    string TokenType,
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    DateTimeOffset RefreshTokenExpiresAt,
    UserResponseDto User);
