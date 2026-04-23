Learnify English — Design snippets and integration

What I added
- `src/assets/scss/_theme.scss` — CSS custom properties, utilities (cards, buttons, hero, sidebar, stats), and responsive rules
- Updated `src/assets/scss/_variables.scss` to match the requested palette and typography
- Updated `src/assets/scss/style.scss` to load Inter font and import the theme
- `src/assets/design/homepage-example.html` — static homepage snippet (hero, CTAs, features, roles)
- `src/assets/design/dashboard-example.html` — static dashboard snippet (sidebar, stats, calendar placeholder)

How to preview quickly
1. Ensure your dev server is running (e.g., `npm run start` or `npm run dev` depending on project scripts).
2. Open `src/assets/design/homepage-example.html` or `src/assets/design/dashboard-example.html` in the browser (serve them or paste into a simple HTML runner) to preview styles.

Notes
- These are design-level assets and CSS utilities to start applying a modern product UI across the app.
- Next steps: convert key Angular components (navbar, hero, dashboard, cards) to use these classes, and wire role-based content.
