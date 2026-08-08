# Phran.dev IoT Automation Client

React + TypeScript client organized by feature, with Redux Toolkit, Axios,
React Router, Tailwind CSS v4, and shadcn/ui.

## Run

```bash
npm install
npm run dev
```

The client runs on `http://localhost:5173` and calls the API at
`http://localhost:5178/api` by default. Override it in `.env` when needed:

```bash
VITE_API_URL=http://localhost:5178/api
```

## Structure

```text
src/
├── app/          Redux store and typed hooks
├── components/   Shared common, layout, and UI components
├── features/     Feature-owned API, UI, state, and types
├── layouts/      Route-level layouts
├── lib/          Shared infrastructure such as Axios
├── routes/       Route definitions and guards
├── styles/       Global styles
├── App.tsx
└── main.tsx
```

UI primitives in `src/components/ui` are generated from the shadcn/ui registry.
Add another component with:

```bash
npx shadcn@latest add dialog
```

## Tests and generated API types

```bash
npm run test
npm run test:coverage
```

The client DTO definitions in `src/api/schema.d.ts` are generated from the
server OpenAPI document. Start the development API, then regenerate after an API
contract change:

```bash
npm run generate:api
```

Set `OPENAPI_URL` to use another schema URL. The generator reads OpenAPI JSON
directly and has no third-party code-generation dependency.

## Authentication flow

1. Login calls `POST /api/auth/login`.
2. The refresh token is stored only in an HttpOnly cookie; JavaScript never
   reads it.
3. The access token is held in memory and Axios adds it to authenticated requests.
4. App startup obtains a new access token from `POST /api/auth/refresh`.
5. An expired access token is rotated with `POST /api/auth/refresh`.
6. Logout revokes the refresh-token cookie and always clears local state, even
   when the API is unavailable.
