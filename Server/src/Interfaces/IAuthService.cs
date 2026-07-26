using Server.DTOs;
using Server.Features.Auth;

namespace Server.Interfaces;

public interface IAuthService
{
    Task<AuthResult<AuthResponse>> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default);

    Task<AuthResult<AuthResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task<AuthResult<AuthResponse>> RefreshAsync(
        RefreshRequest request,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(
        LogoutRequest request,
        CancellationToken cancellationToken = default);

    Task<UserResponse?> GetCurrentUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
