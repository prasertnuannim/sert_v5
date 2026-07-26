using Server.Models;

namespace Server.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default);

    void Add(RefreshToken refreshToken);
}
