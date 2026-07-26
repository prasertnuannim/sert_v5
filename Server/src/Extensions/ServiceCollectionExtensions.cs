using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Features.Auth;
using Server.Interfaces;
using Server.Models;
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

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        var jwtOptions = GetAndValidateJwtOptions(configuration);
        services.Configure<JwtOptions>(
            configuration.GetSection(JwtOptions.SectionName));
        services.Configure<DefaultUserOptions>(
            configuration.GetSection(DefaultUserOptions.SectionName));

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
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(
                AccessPolicies.DevicesRead,
                policy => policy.RequireRole(
                    UserRoles.Viewer,
                    UserRoles.Operator,
                    UserRoles.Engineer,
                    UserRoles.Admin));
            options.AddPolicy(
                AccessPolicies.DevicesControl,
                policy => policy.RequireRole(
                    UserRoles.Operator,
                    UserRoles.Engineer,
                    UserRoles.Admin));
            options.AddPolicy(
                AccessPolicies.AutomationManage,
                policy => policy.RequireRole(
                    UserRoles.Engineer,
                    UserRoles.Admin));
            options.AddPolicy(
                AccessPolicies.UserAdministration,
                policy => policy.RequireRole(UserRoles.Admin));
        });
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAuthService, AuthService>();
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
                    .AllowAnyMethod());
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
}
