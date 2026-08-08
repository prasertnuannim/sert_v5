using Server.Entities;
using Server.Security;

namespace Server.Models;

public sealed class UserModel : BaseEntity
{
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = UserRolesSecurity.Viewer;
    public AccessRoleModel RoleDefinition { get; set; } = null!;
    public ICollection<RefreshTokenModel> RefreshTokens { get; set; } = [];
}
