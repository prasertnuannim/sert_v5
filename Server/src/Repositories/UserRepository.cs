using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Interfaces;
using Server.Models;

namespace Server.Repositories;

public sealed class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<bool> EmailExistsAsync(
        string email,
        CancellationToken cancellationToken = default) =>
        db.Users.AnyAsync(x => x.Email == email, cancellationToken);

    public Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default) =>
        db.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);

    public Task<User?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        db.Users
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<User>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        await db.Users
            .AsNoTracking()
            .OrderBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);

    public void Add(User user) => db.Users.Add(user);

    public void Remove(User user) => db.Users.Remove(user);
}
