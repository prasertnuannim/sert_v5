using Server.Models;

namespace Server.Interfaces;

public interface ITokenService
{
    IssuedTokens IssueTokens(User user);
    string HashRefreshToken(string token);
}

public sealed record IssuedTokens(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    string RefreshTokenHash,
    DateTimeOffset RefreshTokenExpiresAt);
