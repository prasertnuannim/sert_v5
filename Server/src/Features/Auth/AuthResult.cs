namespace Server.Features.Auth;

public enum AuthResultStatus
{
    Success,
    Conflict,
    Unauthorized
}

public sealed record AuthResult<T>(
    AuthResultStatus Status,
    T? Value = default,
    string? Error = null)
{
    public static AuthResult<T> Success(T value) =>
        new(AuthResultStatus.Success, value);

    public static AuthResult<T> Conflict(string error) =>
        new(AuthResultStatus.Conflict, Error: error);

    public static AuthResult<T> Unauthorized(string error) =>
        new(AuthResultStatus.Unauthorized, Error: error);
}
