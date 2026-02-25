# FA Client Portal

## Cursor Cloud specific instructions

This is a React 19 TypeScript SPA (FA Client Portal) built with Vite. It connects to an external FA Platform backend — there is no local backend to run.

### Key commands

All standard commands are in `package.json` scripts:

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev server (port 3000) | `pnpm dev` |
| Lint | `pnpm run validate:lint` |
| Type check | `pnpm run validate:types` |
| Format check | `pnpm run validate:format` |
| Full validation | `pnpm run validate` |
| Unit tests | `pnpm test:ci` |
| Build | `pnpm build` |
| Fix lint + format | `pnpm run fix` |

### Known issues

- `pnpm run validate:types` has 2 pre-existing errors in `NavigationStack.tsx` (missing module declarations for `pages/authUser/routes` and `pages/userWithLinkedContact/routes`). These do not affect `pnpm build` or `pnpm dev`.
- `pnpm run validate:format` reports 23 files with formatting issues (pre-existing in the repo).
- After `pnpm install`, build scripts for `esbuild` and `core-js` may be ignored. Run `pnpm rebuild esbuild` if Vite fails to start.

### Authentication

The app requires Keycloak authentication against the FA Platform at the URL specified in `.env` (`VITE_API_URL`). On `pnpm dev`, the app redirects to the Keycloak login page. The Keycloak config is in `public/keycloak.json`.

To log in programmatically, use environment secrets `FA_TEST_USERNAME`, `FA_TEST_PASSWORD`, and `FA_TEST_OTP_SEED`. Generate TOTP codes with: `oathtool --totp -b "$FA_TEST_OTP_SEED"`. OTP codes expire every 30 seconds — generate immediately before use.

### Proxy setup

The Vite dev server proxies `/graphql` requests to the remote FA backend (configured in `vite.config.ts` using `VITE_API_URL` from `.env`).

### Pre-commit hooks

Husky runs `lint-staged` (ESLint + Prettier) on staged files via `.husky/pre-commit`, and commitlint on commit messages via `.husky/commit-msg`.
