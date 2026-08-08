namespace Server.Security;

public static class UserRolesSecurity
{
    public const string Viewer = "viewer";
    public const string Operator = "operator";
    public const string Engineer = "engineer";
    public const string Admin = "admin";

    public static readonly string[] All =
        [Viewer, Operator, Engineer, Admin];

    public static bool IsValid(string role) =>
        All.Contains(role, StringComparer.OrdinalIgnoreCase);

    public static string Normalize(string role) =>
        role.Trim().ToLowerInvariant();
}
