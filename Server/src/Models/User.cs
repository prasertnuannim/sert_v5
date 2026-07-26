using Server.Entities;
using Server.Security;

namespace Server.Models;

public sealed class User : BaseEntity
{
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = UserRoles.Viewer;
    public AccessRole RoleDefinition { get; set; } = null!;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
