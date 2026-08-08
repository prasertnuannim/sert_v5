using Server.DTOs;

namespace Server.Features.Auth;

public sealed record AuthSession(
    AuthResponseDto Response,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt);
