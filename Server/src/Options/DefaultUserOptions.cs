namespace Server.Options;

public sealed class DefaultUserOptions
{
    public const string SectionName = "DefaultUser";

    public bool Enabled { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}
