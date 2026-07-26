namespace Server.Security;

public static class UserRoles
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

public static class AccessPolicies
{
    public const string DevicesRead = "devices:read";
    public const string DevicesControl = "devices:control";
    public const string AutomationManage = "automation:manage";
    public const string UserAdministration = "users:manage";
}
