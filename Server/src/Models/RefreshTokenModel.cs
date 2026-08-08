using Server.Entities;

namespace Server.Models;

public sealed class RefreshTokenModel : BaseEntity
{
    public required string TokenHash { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public Guid UserId { get; set; }
    public UserModel User { get; set; } = null!;

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
}
