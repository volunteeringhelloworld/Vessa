# VessA – Integrated project

This folder combines the original Vessa_V2 application with the Tracking, Health_Profile, and Booking feature projects.

## Run locally
1. Open this folder in VS Code.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

TanStack Router's file-route generator should refresh `src/routeTree.gen.ts` when Vite starts and detect the added route files.

## Integration map
- `/home` – original Vessa_V2 dashboard.
- `/appointments` and `/book/*` – Booking flow.
- `/medication` redirects to `/medication/dashboard`; `/medication/*` – Tracking flow.
- `/health-profile` redirects to `/profile/`; `/profile/*` – Health Profile flow.
- `/account` currently redirects to `/profile/` because the supplied projects did not include a separate account page.

## Important notes
- Vessa_V2 remains the base project and its design tokens, fonts, dashboard, and bottom navigation are retained.
- Feature screens share Vessa_V2's bottom navigation and theme aliases.
- The supplied projects use separate client-side stores for some features. Data entered in one feature may not automatically appear in another feature's dashboard until the stores are connected.
- This is a source-code integration, not a hosted deployment. Review the app locally and test the main flows before publishing.
- Dependencies are declared in the existing `package.json`; run `npm install` in your own environment before starting.
