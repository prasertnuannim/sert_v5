namespace Server.Models;

public sealed class AccessRoleModel
{
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public required string Description { get; set; }
    public int Level { get; set; }
    public ICollection<UserModel> Users { get; set; } = [];
}
