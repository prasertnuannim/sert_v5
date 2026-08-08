using Server.Models;

namespace Server.Interfaces;

public interface ITokenService
{
    IssuedTokensModel IssueTokens(UserModel user);
    string HashRefreshToken(string token);
}
