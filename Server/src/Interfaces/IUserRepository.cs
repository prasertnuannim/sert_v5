using Server.Models;

namespace Server.Interfaces;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<UserModel?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<UserModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserModel>> GetAllAsync(CancellationToken cancellationToken = default);
    void Add(UserModel user);
    void Remove(UserModel user);
}
