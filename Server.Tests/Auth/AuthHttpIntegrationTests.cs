using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;
using Xunit;

namespace Server.Tests.Auth;

public sealed class PostgreSqlFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container =
        new PostgreSqlBuilder("postgres:17-alpine")
            .WithDatabase("sert_http_tests")
            .WithUsername("sert")
            .WithPassword("sert_test_password")
            .Build();

    public string ConnectionString => _container.GetConnectionString();

    public Task InitializeAsync() => _container.StartAsync();

    public Task DisposeAsync() => _container.DisposeAsync().AsTask();
}

public sealed class TestApiFactory(
    PostgreSqlFixture database,
    bool registrationEnabled = false) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", database.ConnectionString);
        builder.UseSetting("Jwt:Issuer", "SertApiTests");
        builder.UseSetting("Jwt:Audience", "SertClientTests");
        builder.UseSetting("Jwt:Key", "http-integration-test-key-at-least-32-bytes");
        builder.UseSetting("Jwt:AccessTokenMinutes", "15");
        builder.UseSetting("Jwt:RefreshTokenDays", "7");
        builder.UseSetting("Registration:Enabled", registrationEnabled.ToString());
        builder.UseSetting("DefaultUser:Enabled", "false");
    }
}

public sealed class AuthHttpIntegrationTests(PostgreSqlFixture database) :
    IClassFixture<PostgreSqlFixture>
{
    [Fact]
    public async Task Registration_IsDisabledByDefaultPolicy()
    {
        await using var factory = new TestApiFactory(database);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"disabled-{Guid.NewGuid():N}@example.com",
            password = "Password123!",
            displayName = "Disabled"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RegisterRefreshMeAndLogout_UseRotatingHttpOnlyCookie()
    {
        await using var factory = new TestApiFactory(database, registrationEnabled: true);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
        var email = $"http-{Guid.NewGuid():N}@example.com";

        var registration = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "Password123!",
            displayName = "HTTP Test"
        });

        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);
        var firstCookie = Assert.Single(
            registration.Headers.GetValues("Set-Cookie"),
            value => value.StartsWith("sert.refreshToken=", StringComparison.Ordinal));
        Assert.Contains("httponly", firstCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", firstCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", firstCookie, StringComparison.OrdinalIgnoreCase);

        var firstSession = await registration.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(firstSession);
        Assert.Equal(email, firstSession.User.Email);

        var refresh = await client.PostAsync("/api/auth/refresh", content: null);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        var secondCookie = Assert.Single(
            refresh.Headers.GetValues("Set-Cookie"),
            value => value.StartsWith("sert.refreshToken=", StringComparison.Ordinal));
        Assert.NotEqual(firstCookie, secondCookie);

        var refreshedSession = await refresh.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(refreshedSession);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", refreshedSession.AccessToken);

        var me = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);

        var logout = await client.PostAsync("/api/auth/logout", content: null);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        var refreshAfterLogout = await client.PostAsync("/api/auth/refresh", content: null);
        Assert.Equal(HttpStatusCode.Unauthorized, refreshAfterLogout.StatusCode);
    }

    [Fact]
    public async Task HealthEndpoints_ReportLivenessAndDatabaseReadiness()
    {
        await using var factory = new TestApiFactory(database);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var live = await client.GetAsync("/health/live");
        var ready = await client.GetAsync("/health/ready");

        Assert.Equal(HttpStatusCode.OK, live.StatusCode);
        Assert.Equal(HttpStatusCode.OK, ready.StatusCode);
    }

    private sealed record AuthResponse(string AccessToken, UserResponse User);
    private sealed record UserResponse(string Email);
}
