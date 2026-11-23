# How the Figma export was turned into the real front end

The export (`Indian_Recipe_Meal_Planner.zip`) was a complete, self-contained React app. It looked right but kept everything in the browser: fake accounts in `localStorage`, 21 recipes typed into `data.ts`, an `if/else` "Chef AI", shopping list in memory. Integration means **keeping every screen and replacing the data source with the API**.

## 1. What was removed from the export (not needed in your repo)
| Removed | Why |
|---|---|
| `.figma/` folder (deploy scripts, `site.json`, `dev.json`…) | Only used by the Figma Make preview |
| `CLAUDE.md`, `AGENTS.md`, `.mise.toml`, `.gitattributes` | Notes/tooling for the Figma Make agent |
| `pnpm-lock.yaml` | Your course uses `npm`; `npm install` creates `package-lock.json` |
| 5 Figma-only plugins + `site.json` import inside `vite.config.ts` (`figmaSiteConfiguration`, `figmaErrorOverlayReplay`, `figmaReactRefreshBoundaryFallback`, `figmaMakeKitPlugin`, `figmaLinkedPackageSourcemaps`) | They only make the Figma preview work. New `vite.config.ts` = React + Tailwind plugins + the `/api` proxy (Module 5) |
| `oxfmt` dev dependency and `format` script | Figma formatter |
| Port `8443`, host `0.0.0.0`, `FIGMA_*` environment variables | Replaced by port `5173` (as in your course slides) |
| `<!-- figma:… -->` placeholder comments in `index.html` | Replaced by a real `<title>`, description, favicon link |
| `@` path alias | Nothing used it |

## 2. What was added or changed
| File | Change |
|---|---|
| `src/api.ts` **(new)** | Every `fetch` to the server in one file |
| `src/data.ts` | The 21 hard-coded recipes moved to `server/data/featured_recipes.json`. Kept all helpers (diet rules, pantry matching, catalog). Added `toUi()` / `fromUi()` which convert database recipes to/from the shape the screens use, and placeholder photos for dishes with no photo |
| `src/App.tsx` | `localStorage` "database" replaced by state loaded from the API; guests can browse but saving needs an account; shopping-list sheet moved out |
| `src/grocery.tsx` **(new)** | The shopping-list sheet (code moved out of App.tsx, now calls the API) |
| `src/plans.tsx` **(new)** | Meal-plan card (drawn from server data) + "Saved meal plans" list |
| `src/auth.tsx` | Fake accounts and SHA hashing removed; real register/login. **Removed the Google/Apple buttons** (they faked a login). "Forgot password" now says honestly that no email is sent |
| `src/profile.tsx` | New "calculate my target" block (age/height/weight/activity/goal) → server formula |
| `src/kitchen.tsx` | Fake reply engine removed; calls `POST /api/chat`; chat history loads from the database; "Clear chat" button; typing delay removed (the real request takes the time) |
| `src/recipes.tsx` | "Show more" (24 at a time) because the database has 1,000+ recipes; loading/error states |
| `src/addrecipe.tsx` | Save is a real `POST`/`PUT`; new *Meal* chips (Breakfast/Lunch/Dinner/Snack) so the planner can use your recipe |
| `src/shared.tsx` | The recipe sheet now also shows the **Method** (steps) |
| `src/home.tsx` | Featured recipes are looked up by name in the database |

Unchanged: `ui.tsx`, `theme.ts`, `index.css`, `settings.tsx`, `pantry.tsx`, `main.tsx`: all styling, themes, animations, icons, pantry picker.

## 3. Images
The export has **no image files** except `public/favicon.svg`. Every photo is a hot-linked Unsplash URL, so the site needs internet. Dishes from the CSV have no photo, so the UI shows a stock photo of the same *kind* of dish (breakfast, curry, dessert…); it is an illustration, not that exact dish. To work offline later: download the photos into `client/public/images/` and change the URLs.

## 4. If the fonts look different
The fonts (Anton, DM Sans) load from Google Fonts through an `@import` at the top of `index.css`. With no internet the page falls back to system fonts; everything still works.
