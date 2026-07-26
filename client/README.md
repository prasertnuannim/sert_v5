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

## Authentication flow

1. Login calls `POST /api/auth/login`.
2. Access and refresh tokens are persisted locally.
3. Axios adds the access token to authenticated requests.
4. App startup verifies the token with `GET /api/auth/me`.
5. An expired access token is rotated with `POST /api/auth/refresh`.
6. Logout revokes the refresh token and clears the local session.
