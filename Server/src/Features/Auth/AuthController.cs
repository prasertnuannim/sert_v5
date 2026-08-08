using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Server.DTOs;
using Server.Interfaces;
using Server.Options;
using Server.Security;

namespace Server.Features.Auth;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IAuthService authService,
    IWebHostEnvironment environment,
    IOptions<RegistrationOptions> registrationOptions) : ControllerBase
{
    private const string RefreshTokenCookie = "sert.refreshToken";

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPoliciesSecurity.Authentication)]
    [ProducesResponseType<AuthResponseDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!registrationOptions.Value.Enabled)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Registration unavailable",
                detail: "Public account registration is disabled.");
        }

        var result = await authService.RegisterAsync(request, cancellationToken);

        return result.Status switch
        {
            AuthResultStatus.Success => CreateAuthenticatedResult(
                result.Value!,
                StatusCodes.Status201Created),
            AuthResultStatus.Conflict => Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: result.Error),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPoliciesSecurity.Authentication)]
    [ProducesResponseType<AuthResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return AuthResult(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPoliciesSecurity.Authentication)]
    [ProducesResponseType<AuthResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue(RefreshTokenCookie, out var refreshToken))
        {
            return UnauthorizedProblem("Invalid or expired refresh token.");
        }

        var result = await authService.RefreshAsync(refreshToken, cancellationToken);
        return AuthResult(result);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPoliciesSecurity.Authentication)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(
        CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(RefreshTokenCookie, out var refreshToken))
        {
            await authService.LogoutAsync(refreshToken, cancellationToken);
        }

        Response.Cookies.Delete(RefreshTokenCookie, CookieOptions());
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType<UserResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue("sub"), out var userId))
        {
            return UnauthorizedProblem("Invalid access token.");
        }

        var user = await authService.GetCurrentUserAsync(userId, cancellationToken);
        return user is null
            ? UnauthorizedProblem("User no longer exists.")
            : Ok(user);
    }

    private IActionResult AuthResult(AuthResult<AuthSession> result) =>
        result.Status switch
        {
            AuthResultStatus.Success => CreateAuthenticatedResult(
                result.Value!,
                StatusCodes.Status200OK),
            AuthResultStatus.Unauthorized => UnauthorizedProblem(
                result.Error ?? "Unauthorized."),
            _ => Problem(statusCode: StatusCodes.Status500InternalServerError)
        };

    private ObjectResult CreateAuthenticatedResult(AuthSession session, int statusCode)
    {
        Response.Cookies.Append(
            RefreshTokenCookie,
            session.RefreshToken,
            CookieOptions(session.RefreshTokenExpiresAt));

        return StatusCode(statusCode, session.Response);
    }

    private CookieOptions CookieOptions(DateTimeOffset? expires = null) => new()
    {
        HttpOnly = true,
        Secure = !environment.IsDevelopment() || Request.IsHttps,
        SameSite = SameSiteMode.Strict,
        Path = "/api/auth",
        Expires = expires,
        IsEssential = true
    };

    private ObjectResult UnauthorizedProblem(string detail) =>
        Problem(
            statusCode: StatusCodes.Status401Unauthorized,
            title: "Unauthorized",
            detail: detail);
}
