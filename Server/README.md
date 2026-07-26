# Authentication API

ASP.NET Core authentication backend using JWT access tokens, rotating refresh
tokens, password hashing, and PostgreSQL.

## Structure

```text
src/
├── Controllers/   HTTP endpoints
├── Data/          EF Core database context
├── DTOs/          Request and response contracts
├── Entities/      Shared entity base types
├── Extensions/    Dependency injection and application pipeline setup
├── Features/      Authentication business logic
├── Interfaces/    Service and repository contracts
├── Middleware/    Global exception handling
├── Models/        User and refresh-token persistence models
├── Repositories/  Database access implementations
└── Services/      JWT and refresh-token generation
```

## Run

```bash
docker compose up -d
dotnet run
```

PostgreSQL listens on `localhost:5434` and development API listens on
`http://localhost:5178`. Tables are created automatically when the API starts.

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
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Public (revokes supplied refresh token) |
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

Refresh and logout body:

```json
{
  "refreshToken": "token returned by register, login, or refresh"
}
```
