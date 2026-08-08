# Phran.dev IoT Automation Platform

Monorepo containing an ASP.NET Core authentication and access-control API plus
a React/Vite client.

## Projects

- `Server/` — ASP.NET Core, EF Core, PostgreSQL, JWT access tokens, rotating
  HttpOnly refresh-token cookies, and role-based authorization.
- `Server.Tests/` — authentication lifecycle integration tests using the real
  service/repository stack with an isolated EF Core database.
- `client/` — React, TypeScript, Redux Toolkit, React Router, Tailwind CSS, and
  shadcn/ui.

## Local development

```bash
cd Server
docker compose up -d
dotnet run
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

The API runs at `http://localhost:5178`; the client runs at
`http://localhost:5173`.

## Verification

```bash
dotnet test sert_v5.sln
cd client && npm run test && npm run build && npm run lint
```

The .NET HTTP integration tests use a disposable PostgreSQL Testcontainer, so
Docker must be running.
