# Authentication API

ASP.NET Core authentication backend using JWT access tokens, rotating refresh
tokens, password hashing, and PostgreSQL.

## Structure

```text
src/
├── Data/          EF Core database context and migrations
├── DTOs/          Request and response contracts
├── Entities/      Shared entity base types
├── Extensions/    Dependency injection and application pipeline setup
├── Features/      Feature-owned endpoints and business logic
├── Interfaces/    Service and repository contracts
├── Middleware/    Global exception handling
├── Models/        User and refresh-token persistence models
├── Options/       Strongly typed application configuration
├── Repositories/  Database access implementations
└── Services/      JWT and refresh-token generation
```

## Run

```bash
docker compose up -d
dotnet run
```

PostgreSQL listens on `localhost:5434` and development API listens on
`http://localhost:5178`. EF Core migrations are applied automatically when the
API starts.

The initial migration is backward-compatible with local databases created by
the older `EnsureCreated` startup path. It records the migration while preserving
existing users and refresh tokens; deleting the Docker volume is not required.

Default local database credentials:

```text
Database: sert_auth
Username: sert
Password: sert_dev_password
```

Default development application account:

```text
Email: admin@sert.local
Password: Admin123!
```

The account is created only when `DefaultUser:Enabled` is true. Existing
accounts are never overwritten, and the password is stored only as a hash.

For non-development environments, set a random secret of at least 32 bytes:

```bash
Jwt__Key="replace-with-a-long-random-secret" dotnet run
```

## Endpoints

| Method | Endpoint | Authentication |
| --- | --- | --- |
| POST | `/api/auth/register` | Public only when `Registration:Enabled` is true |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | HttpOnly refresh-token cookie |
| POST | `/api/auth/logout` | HttpOnly refresh-token cookie |
| GET | `/api/auth/me` | Bearer access token |

Register body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "Example User"
}
```

Login body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Login, register, and refresh responses set a rotating `HttpOnly`, `SameSite=Strict`
refresh-token cookie. Refresh and logout requests have no body. The JSON response
contains only the short-lived access token and user details.

Public registration is disabled by default. For an intentional self-service
deployment, enable it explicitly:

```bash
Registration__Enabled=true dotnet run
```

Administrative account creation remains available through `POST /api/users`.

## Health checks

- `/health/live` and `/health` check whether the API process is alive.
- `/health/ready` verifies that PostgreSQL is reachable.

## Reverse proxy

Forwarded headers are disabled by default. When the API is behind a proxy,
enable them and list every trusted proxy IP; unlisted senders are ignored:

```json
{
  "ReverseProxy": {
    "Enabled": true,
    "KnownProxies": ["10.0.0.10"]
  }
}
```

## Migrations

```bash
dotnet ef migrations add MigrationName --output-dir src/Data/Migrations
dotnet ef database update
```
