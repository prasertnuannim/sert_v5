using Server.Models;

namespace Server.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshTokenModel?> GetByHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default);

    void Add(RefreshTokenModel refreshToken);
}
