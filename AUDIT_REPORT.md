# Audit Report — quick automated checks

Date: 2026-08-17

Summary:

- Tests: 19 passed, 0 failed. (Vitest run completed)
- Lint: ESLint run produced no output (pre-commit lint previously executed; no errors reported).
- Build: Vite production build completed and `dist/` artifacts generated.
- Security scan: `scripts/scan-secrets.js` ran during git commit and found no obvious secrets.

Notes / Warnings observed during runs:

- Some test warnings (DOM/media methods not implemented in JSDOM) and a skipped integration test that requires a local Supabase/Postgres instance; these are expected in the local environment without external services.
- A few React testing warnings (act(...) wrappers) are present in unit tests but tests still pass.

Recommendations:

- Consider adding a small CI job to run full integration tests with a Supabase/Postgres test instance (e.g., using `supabase start` in CI) if integration coverage is required.
- Address `act(...)` warnings in tests where state updates occur during rendering.

Artifacts:

- `dist/` directory generated locally.
- `public/assets/scarab-logo.png` added and `src/components/layout/LandingNav.jsx` updated to use it as primary logo.

Committed changes:

- chore: add scarab logo and use as primary site logo (pushed to `dev`)

End of report.
