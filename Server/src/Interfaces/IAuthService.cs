using Server.DTOs;
using Server.Features.Auth;

namespace Server.Interfaces;

public interface IAuthService
{
    Task<AuthResult<AuthSession>> RegisterAsync(
        RegisterRequestDto request,
        CancellationToken cancellationToken = default);

    Task<AuthResult<AuthSession>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default);

    Task<AuthResult<AuthSession>> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task<UserResponseDto?> GetCurrentUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
