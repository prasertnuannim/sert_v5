namespace Server.Models;

public sealed class AccessRole
{
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public required string Description { get; set; }
    public int Level { get; set; }
    public ICollection<User> Users { get; set; } = [];
}
