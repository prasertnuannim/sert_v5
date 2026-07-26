using Server.Data;
using Server.Interfaces;

namespace Server.Repositories;

public sealed class UnitOfWork(
    AppDbContext db,
    IUserRepository users,
    IRefreshTokenRepository refreshTokens) : IUnitOfWork
{
    public IUserRepository Users { get; } = users;
    public IRefreshTokenRepository RefreshTokens { get; } = refreshTokens;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
