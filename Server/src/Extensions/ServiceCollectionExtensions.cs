using System.Security.Claims;
using System.Net;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Features.Auth;
using Server.Features.Health;
using Server.Features.Roles;
using Server.Features.Users;
using Server.Interfaces;
using Server.Models;
using Server.Options;
using Server.Repositories;
using Server.Security;
using Server.Services;

namespace Server.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers();
        services.AddProblemDetails();
        services.AddHealthChecks()
            .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        var jwtOptions = GetAndValidateJwtOptions(configuration);
        services.Configure<JwtOptions>(
            configuration.GetSection(JwtOptions.SectionName));
        services.Configure<DefaultUserOptions>(
            configuration.GetSection(DefaultUserOptions.SectionName));
        services.Configure<RegistrationOptions>(
            configuration.GetSection(RegistrationOptions.SectionName));
        ConfigureReverseProxy(services, configuration);

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions.Key)),
                    NameClaimType = "name",
                    RoleClaimType = "role",
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = ValidateCurrentUserAsync
                };
            });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(
                RateLimitPoliciesSecurity.Authentication,
                httpContext => RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString()
                        ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 20,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(
                AccessPoliciesSecurity.DevicesRead,
                policy => policy.RequireRole(
                    UserRolesSecurity.Viewer,
                    UserRolesSecurity.Operator,
                    UserRolesSecurity.Engineer,
                    UserRolesSecurity.Admin));
            options.AddPolicy(
                AccessPoliciesSecurity.DevicesControl,
                policy => policy.RequireRole(
                    UserRolesSecurity.Operator,
                    UserRolesSecurity.Engineer,
                    UserRolesSecurity.Admin));
            options.AddPolicy(
                AccessPoliciesSecurity.AutomationManage,
                policy => policy.RequireRole(
                    UserRolesSecurity.Engineer,
                    UserRolesSecurity.Admin));
            options.AddPolicy(
                AccessPoliciesSecurity.UserAdministration,
                policy => policy.RequireRole(UserRolesSecurity.Admin));
        });
        services.AddScoped<IPasswordHasher<UserModel>, PasswordHasher<UserModel>>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWorkRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<RoleQueryService>();
        services.AddScoped<UserAdministrationService>();
        services.AddScoped<DatabaseSeeder>();

        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?? ["http://localhost:5173"];

        services.AddCors(options =>
        {
            options.AddPolicy("Client", policy =>
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        return services;
    }

    private static JwtOptions GetAndValidateJwtOptions(IConfiguration configuration)
    {
        var options = configuration
            .GetSection(JwtOptions.SectionName)
            .Get<JwtOptions>()
            ?? throw new InvalidOperationException("Missing Jwt configuration.");

        if (string.IsNullOrWhiteSpace(options.Issuer) ||
            string.IsNullOrWhiteSpace(options.Audience) ||
            options.AccessTokenMinutes <= 0 ||
            options.RefreshTokenDays <= 0 ||
            Encoding.UTF8.GetByteCount(options.Key) < 32)
        {
            throw new InvalidOperationException(
                "Jwt configuration requires an issuer, audience, positive lifetimes, and a key of at least 32 bytes.");
        }

        return options;
    }

    private static void ConfigureReverseProxy(
        IServiceCollection services,
        IConfiguration configuration)
    {
        var proxyOptions = configuration
            .GetSection(ReverseProxyOptions.SectionName)
            .Get<ReverseProxyOptions>()
            ?? new ReverseProxyOptions();

        if (!proxyOptions.Enabled)
        {
            return;
        }

        if (proxyOptions.KnownProxies.Length == 0)
        {
            throw new InvalidOperationException(
                "Enabled ReverseProxy configuration requires at least one trusted proxy IP address.");
        }

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders =
                ForwardedHeaders.XForwardedFor |
                ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = proxyOptions.KnownProxies.Length;
            options.KnownProxies.Clear();
            options.KnownIPNetworks.Clear();

            foreach (var value in proxyOptions.KnownProxies)
            {
                if (!IPAddress.TryParse(value, out var address))
                {
                    throw new InvalidOperationException(
                        $"ReverseProxy:KnownProxies contains an invalid IP address: {value}");
                }

                options.KnownProxies.Add(address);
            }
        });
    }

    private static async Task ValidateCurrentUserAsync(
        TokenValidatedContext context)
    {
        var userIdValue = context.Principal?.FindFirstValue("sub");
        var tokenRole = context.Principal?.FindFirstValue("role");
        if (!Guid.TryParse(userIdValue, out var userId) ||
            string.IsNullOrWhiteSpace(tokenRole))
        {
            context.Fail("The access token is missing required claims.");
            return;
        }

        var db = context.HttpContext.RequestServices
            .GetRequiredService<AppDbContext>();
        var currentRole = await db.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.Role)
            .SingleOrDefaultAsync(context.HttpContext.RequestAborted);

        if (currentRole is null ||
            !string.Equals(currentRole, tokenRole, StringComparison.Ordinal))
        {
            context.Fail("The account no longer exists or its role has changed.");
        }
    }
}
