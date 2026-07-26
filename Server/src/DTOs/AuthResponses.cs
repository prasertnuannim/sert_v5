namespace Server.DTOs;

public sealed record UserResponse(
    Guid Id,
    string Email,
    string DisplayName,
    DateTimeOffset CreatedAt,
    string Role);

public sealed record RoleResponse(
    string Name,
    string DisplayName,
    string Description,
    int Level);

public sealed record AuthResponse(
    string TokenType,
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    UserResponse User);
