using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Interfaces;
using Server.Models;

namespace Server.Repositories;

public sealed class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshTokenModel?> GetByHashAsync(
        string tokenHash,
        CancellationToken cancellationToken = default) =>
        db.RefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

    public void Add(RefreshTokenModel refreshToken) => db.RefreshTokens.Add(refreshToken);
}
