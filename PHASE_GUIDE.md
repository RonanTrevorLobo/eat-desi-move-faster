# PHASE GUIDE 🚀
### Eat Desi, Move Faster: your Figma UI + real backend, one phase at a time

Do **one phase at a time**. Each phase ends with a **"Done when"** check. Do not start the next phase until the check passes.

| Phase | What | Who | Time |
|---|---|---|---|
| 0 | Read what changed (5 min) | everyone | 5 min |
| 1 | Install tools, make accounts | everyone | 30 min |
| 2 | Create the shared database | Ratan | 20 min |
| 3 | Create the GitHub repository | Ronan | 15 min |
| 4 | Each person adds *their* files with Git | everyone | 45 min |
| 5 | Run the finished project | everyone | 20 min |
| 6 | Click-through test + how the UI is wired | everyone | 30 min |
| 7 | Report and viva | everyone | later |
| 8 | *(Optional)* Put it online | Ronan | 45 min |

---

## Phase 0. What changed and why (read once)

You uploaded your Figma export. I read all of it. Three facts shape everything:

1. **It is not plain HTML.** It is a finished **React 19 + TypeScript + Tailwind CSS 4** app (built with Vite). It has 4 colour themes × light/dark, phone bottom-navigation, a 3-step sign-up, a pantry picker, the Chef AI chat with recipe cards, recipe filters, an Add-Recipe wizard, a shopping-list sheet and a profile.
2. **It only *pretends* to have a backend.** Accounts are fake (browser `localStorage`), the 21 recipes are typed into a file, "Chef AI" is an `if/else`, and the shopping list disappears if you clear the browser.
3. **It has no image files.** Only a favicon. Every photo is an Unsplash web link.

So I did the integration **for you**:

- ✅ **Your exact UI is kept.** Same screens, themes, layout, animations.
- ✅ My earlier React-Router client is **replaced** by your Figma code. Ignore the old `eat-desi-move-faster.zip`; use the new one.
- ✅ The backend was extended to match what your UI really needs (regions, meal types, ingredient quantities, allergies, themes, shopping-list aisles, saved plans, chat history).
- ✅ Every button now calls the real API (the full wiring table is in Phase 6).
- ✅ The group split is kept, with new file lists in Phase 4.

> **Your 3 questions, answered**
> - *Where do the Figma files go?* → Phase 4's folder map, and **Section A below**.
> - *What had to be cleaned up?* → Section B below (full list: `docs/figma-integration.md`).
> - *How are forms/buttons connected to the backend?* → Phase 6.

### A. Final folder structure (who owns what)

```
eat-desi-move-faster/
├── README.md  PHASE_GUIDE.md  .gitignore                      ← Ronan (first commit)
├── docs/
│   ├── api.md  testing.md                                      ← Himashree
│   ├── database-design.md                                      ← Ratan
│   └── figma-integration.md                                    ← Ronan
├── client/                      (React + TypeScript + Tailwind, port 5173)
│   ├── package.json  tsconfig.json  vite.config.ts  index.html  ← Ronan   (cleaned Figma config + /api proxy)
│   ├── .gitignore  .env.example  public/favicon.svg             ← Ronan
│   └── src/
│       ├── main.tsx  vite-env.d.ts  index.css  theme.ts  ui.tsx  ← Ronan   (Figma design system, unchanged)
│       ├── api.ts                                              ← Ronan   (EVERY server call lives here)
│       ├── App.tsx  home.tsx  settings.tsx                     ← Ronan
│       ├── pantry.tsx  kitchen.tsx                             ← Ronan   (Chef AI screen)
│       ├── auth.tsx  profile.tsx                               ← Rinku   (login, sign-up, profile)
│       ├── data.ts  shared.tsx                                 ← Ratan   (recipe shapes, cards, recipe sheet)
│       ├── recipes.tsx  addrecipe.tsx  grocery.tsx             ← Ratan
│       └── plans.tsx                                           ← Himashree (meal-plan card + saved plans)
└── server/                      (Express + MongoDB, port 3000)
    ├── package.json  .env.example  .gitignore                  ← Rinku
    ├── data/Indian_Food_Nutrition_Updated.csv  featured_recipes.json   ← Ratan
    ├── src/index.js                                            ← Rinku
    ├── src/models/User.js                                      ← Rinku
    ├── src/models/Recipe.js Grocery.js Plan.js Chat.js         ← Ratan
    ├── src/middleware/auth.js  validate.js                     ← Rinku
    ├── src/routes/auth.js  profile.js                          ← Rinku
    ├── src/routes/recipes.js  favourites.js  grocery.js        ← Ratan
    ├── src/routes/plans.js  chat.js                            ← Himashree
    ├── src/scripts/seed.js                                     ← Ratan
    ├── src/utils/constants.js  calories.js                     ← Rinku
    ├── src/utils/classify.js  aisle.js                         ← Ratan
    ├── src/utils/diet.js allergens.js pantry.js mealPlanner.js planService.js aiService.js  ← Himashree
    └── test/                                                   ← each person owns the tests of their own utils
```

### B. Cleanup that was needed (short version)

| Problem in the export | Fix |
|---|---|
| `vite.config.ts` full of Figma-preview plugins, port 8443, `.figma/site.json` import | Rewritten: React + Tailwind + **proxy `/api` → port 3000**, port 5173 |
| `index.html` had `<!-- figma:title -->` placeholders | Real title, description, favicon link |
| `.figma/`, `CLAUDE.md`, `AGENTS.md`, `.mise.toml`, `pnpm-lock.yaml`, `oxfmt` | Removed (not needed; the course uses `npm`) |
| Fake login, hard-coded recipes, fake chat, memory-only list | Replaced by API calls (`api.ts`) |
| Google / Apple login buttons (fake) | Removed (they pretended to log you in) |
| "Forgot password" claimed to send an email | Text now says honestly that no email is sent |
| Images were web links to Unsplash | Kept (needs internet). Dishes with no photo get a stock photo of the same kind of dish |

---

## Phase 1. Install tools and make accounts (everyone)

1. **Node.js 22 (LTS)**: https://nodejs.org → LTS button → install. Open a **new** terminal (Windows: PowerShell):
   ```
   node -v
   npm -v
   ```
   Both must print versions. (The Figma export targets Node 22; older Node may fail with the newest Vite.)
2. **Git**: https://git-scm.com/downloads. Then in a new terminal `git --version`.
3. **VS Code**: https://code.visualstudio.com.
4. **GitHub account**: https://github.com/signup (college email, Free plan).
5. Tell Git who you are. **Use the same email as your GitHub account**, otherwise your commits do not count as yours:
   ```
   git config --global user.name "Your Full Name"
   git config --global user.email "you@college.edu"
   ```
6. Download and **unzip** the project (`eat-desi-move-faster-v2.zip`) to a scratch folder such as `Downloads/starter`. This is your **source of files to copy from**, not your Git folder.

✅ **Done when:** `node -v`, `npm -v`, `git --version` all print versions, and `starter` contains the folders `client`, `server`, `docs`.

---

## Phase 2. Create the shared database (Ratan only)

We use **MongoDB Atlas** (free, in the cloud) so all four of you share the same data.

1. https://www.mongodb.com/cloud/atlas/register → sign up → create a **free (M0) cluster**.
2. **Database Access** → *Add New Database User* → username `eatdesi`, a simple password (letters + numbers only).
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Database** → your cluster → **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://eatdesi:<password>@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the real one and **add `eatdesi` before the `?`**:
   ```
   mongodb+srv://eatdesi:MyPass123@cluster0.abc12.mongodb.net/eatdesi?retryWrites=true&w=majority
   ```
6. Send that string **privately** (WhatsApp) to the team. ⚠️ **Never put it on GitHub.**

Atlas screens change over time, but the idea is always: *cluster → database user → allow your IP → copy connection string*.

✅ **Done when:** each teammate has the connection string saved somewhere private.

---

## Phase 3. Create the GitHub repository (Ronan only)

1. github.com → **New repository** → name `eat-desi-move-faster` → **Public** → tick **nothing** (no README, no .gitignore) → *Create*.
2. *Settings → Collaborators → Add people*: Rinku, Ratan, Himashree. They accept the e-mail invitation.
3. On Ronan's laptop:
   ```
   mkdir eat-desi-move-faster
   cd eat-desi-move-faster
   git init
   ```
   Copy the 3 starting files with `node ../starter/eat-desi-move-faster/copy-my-files.mjs start`. Then:
   ```
   git add README.md PHASE_GUIDE.md .gitignore
   git commit -m "Initial commit: README, phase guide and .gitignore"
   git branch -M main
   git remote add origin https://github.com/RONAN-USERNAME/eat-desi-move-faster.git
   git push -u origin main
   ```
   > GitHub does not accept your website password for `git push`. A browser window usually opens to log in. If it asks for a password, create a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → tick `repo`) and paste that.
4. The other three **clone** (they do **not** run `git init`):
   ```
   cd Documents
   git clone https://github.com/RONAN-USERNAME/eat-desi-move-faster.git
   cd eat-desi-move-faster
   ```

✅ **Done when:** everyone sees `README.md` in their cloned folder, and the repo page on github.com shows the 3 files.

---

## Phase 4. Each person adds their own files (everyone, in parallel)

Rules: your own **branch**, **small commits**, **explicit file names**, then a **pull request**. No two people touch the same file, so there are no merge conflicts.

> ⚠️ **Never run `git add .`**. Only add the exact paths listed for you. Before each commit run `git status` and check that `node_modules` and `.env` do **not** appear.

> **Click-by-click version:** `PHASES_1-4_STEP_BY_STEP.md` (in your `starter` folder) walks through Phases 1 to 4 with the exact output to expect at each step.

**Copying your files is automated.** From inside your cloned repo folder (terminal), type **one** command, with your own name (`rinku`, `ratan`, `himashree` or `ronan`):
```
node ../starter/eat-desi-move-faster/copy-my-files.mjs rinku
```
It copies exactly your files from `starter` (the unzipped project, which must be at `Documents/starter/eat-desi-move-faster`). Then run the `git add` + `git commit` pairs below.

First, everyone:
```
git checkout main
git pull origin main
git checkout -b feature/YOUR-BRANCH      # names are in the boxes below
```

### 🟩 Rinku: `feature/backend-auth`  (backend APIs + authentication)
```
git add server/package.json server/.gitignore server/.env.example server/src/utils/constants.js
git commit -m "Set up Express server project and shared constants"

git add server/src/models/User.js server/src/utils/calories.js server/test/calories.test.js
git commit -m "Add User model and calorie calculator with tests"

git add server/src/middleware/auth.js server/src/middleware/validate.js server/src/routes/auth.js server/src/routes/profile.js server/src/index.js
git commit -m "Add register, login and profile API with JWT"

git add client/src/auth.tsx
git commit -m "Connect welcome, log in and 3-step sign-up screens to the API"

git add client/src/profile.tsx
git commit -m "Connect profile screen: preferences and calorie calculator"
```

### 🟨 Ratan: `feature/database-recipes`  (database + dataset)
```
git add server/src/models/Recipe.js server/src/models/Grocery.js server/src/models/Plan.js server/src/models/Chat.js
git commit -m "Add Recipe, Grocery, Plan and Chat models"

git add server/data/Indian_Food_Nutrition_Updated.csv server/data/featured_recipes.json
git commit -m "Add dataset and the 21 featured recipes from the Figma design"

git add server/src/utils/classify.js server/src/utils/aisle.js server/test/classify.test.js server/test/aisle.test.js
git commit -m "Add diet/region/meal classifier and shopping-aisle guesser with tests"

git add server/src/scripts/seed.js docs/database-design.md
git commit -m "Add seed script and database design doc"

git add server/src/routes/recipes.js server/src/routes/favourites.js server/src/routes/grocery.js
git commit -m "Add recipes, favourites and shopping list APIs"

git add client/src/data.ts client/src/shared.tsx
git commit -m "Add recipe data adapter, recipe cards and recipe sheet"

git add client/src/recipes.tsx client/src/addrecipe.tsx client/src/grocery.tsx
git commit -m "Connect recipe database, add-recipe wizard and shopping list to the API"
```

### 🟪 S Himashree: `feature/ai-planner-docs`  (AI integration, testing, documentation)
```
git add server/src/utils/diet.js server/src/utils/allergens.js server/src/utils/pantry.js server/test/chat-utils.test.js
git commit -m "Add diet, allergy and pantry-matching helpers with tests"

git add server/src/utils/mealPlanner.js server/test/mealPlanner.test.js
git commit -m "Add meal planner algorithm with tests"

git add server/src/utils/planService.js server/src/routes/plans.js
git commit -m "Add meal plan API"

git add server/src/utils/aiService.js server/src/routes/chat.js
git commit -m "Add AI chatbot service and chat API"

git add client/src/plans.tsx
git commit -m "Add meal plan card and saved plans list"

git add docs/api.md docs/testing.md
git commit -m "Add API reference and testing docs"
```

### 🟦 Ronan: `feature/frontend-chatbot`  (frontend + chatbot interface)
```
git add client/package.json client/tsconfig.json client/vite.config.ts client/index.html client/.gitignore client/.env.example client/public/favicon.svg client/src/main.tsx client/src/vite-env.d.ts
git commit -m "Set up React + TypeScript + Tailwind client with API proxy (cleaned Figma export)"

git add client/src/index.css client/src/theme.ts client/src/ui.tsx
git commit -m "Add Figma design system: themes, tokens and UI components"

git add client/src/api.ts
git commit -m "Add api.ts with every server call"

git add client/src/home.tsx client/src/settings.tsx
git commit -m "Add home and theme settings screens"

git add client/src/pantry.tsx client/src/kitchen.tsx
git commit -m "Add Chef AI kitchen: pantry picker and chat connected to the API"

git add client/src/App.tsx docs/figma-integration.md
git commit -m "Add app shell with server-backed state, guest mode and tab navigation"
```

### Then, everyone: push and open a Pull Request
```
git push -u origin feature/YOUR-BRANCH
```
On GitHub click **Compare & pull request** → base `main`, compare your branch → one line about what you did → **Create pull request**.

### A *different* teammate reviews and merges
Open the PR → **Files changed** → read it → **Merge pull request** → Confirm. (Rule: nobody merges their own PR. Reading someone else's part is also how you learn it.)

**Merge in this order: 1️⃣ Rinku → 2️⃣ Ratan → 3️⃣ Himashree → 4️⃣ Ronan.**
The website can only start after **all four** are merged (the app shell imports every screen). That is normal.

Finally everyone: `git checkout main` then `git pull origin main`.

✅ **Done when:** GitHub → *Insights → Contributors* shows all four of you, and your local folder has `client/` and `server/`.

---

## Phase 5. Run the finished project (everyone)

You need **two terminals** open together (Module 5: "One folder. Two terminals.").

### 5.1 Server setup (Terminal 1)
```
cd server
npm install
```
Create your secret settings file:
- Windows PowerShell: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`

Open `server/.env` in VS Code and set **`MONGO_URI`** (the Atlas string from Phase 2) and **`JWT_SECRET`** (any long random text). `.env` is secret and already blocked by `.gitignore`; never commit it.

### 5.2 Load the recipes. **ONE person, ONE time only.**
```
npm run seed
```
Expected: `Inserted 1014 recipes from the CSV + 21 featured recipes` and `Admin created`.
The other three do **not** run it (same shared database). Running it again replaces every seeded recipe with a new copy, which breaks saved favourites and plans.

### 5.3 Start the API
```
npm start
```
Expected: `MongoDB connected` and `API running on http://localhost:3000`. Leave it open. (`npm run dev` restarts automatically when you edit files.)
Quick check: open http://localhost:3000/api/health → `{"status":"up"}`.

### 5.4 Start the website (Terminal 2)
```
cd client
npm install
npm run dev
```
Open **http://localhost:5173**. Stop either terminal with **Ctrl + C**.

✅ **Done when:** the welcome screen ("Eat smart. Cook Indian. Feel strong.") appears and, after "Continue as guest", the **Recipes** tab shows 1,000+ recipes.

---

## Phase 6. Test, and understand how every button is wired

Run the 21-step checklist in **`docs/testing.md`**. Server logic tests: `cd server` then `npm test` (23 tests).

### The wiring table (use this in your viva)

All calls go through **`client/src/api.ts`**; the server routes are in `server/src/routes/`.

| On screen | What the user does | API call | Server file | Client file |
|---|---|---|---|---|
| Sign-up (3 steps) | "Start cooking" | `POST /api/auth/register` | `auth.js` | `auth.tsx` |
| Log in | "Log in" | `POST /api/auth/login` | `auth.js` | `auth.tsx` |
| Any page | refresh → still logged in | `GET /api/auth/me` | `auth.js` | `App.tsx` |
| Profile → Dietary preferences | "Save preferences" | `PUT /api/profile` | `profile.js` | `profile.tsx` |
| Profile → Calculate my target | button | `POST /api/profile/calculate` | `profile.js` + `calories.js` | `profile.tsx` |
| 🎨 Theme | pick a theme | `PUT /api/profile` `{theme}` | `profile.js` | `App.tsx` |
| Recipes | open tab; search; filters | `GET /api/recipes?limit=2000` (filtering happens in the browser) | `recipes.js` | `recipes.tsx` |
| ❤ on a recipe | tap | `POST /api/favourites/:id`; `GET /api/favourites/ids` | `favourites.js` | `App.tsx` |
| Add Recipe (3 steps + review) | "Save to my recipes" | `POST /api/recipes` | `recipes.js` (validation) | `addrecipe.tsx` |
| Recipe card ⋯ menu | Edit / Delete | `PUT` / `DELETE /api/recipes/:id` | `recipes.js` | `shared.tsx`, `addrecipe.tsx` |
| Recipe sheet / Chef AI card | "Add to shopping list" / "Add missing items" | `POST /api/grocery/from-recipes` | `grocery.js` | `shared.tsx`, `kitchen.tsx` |
| 🛒 Shopping list | add, tick, remove, clear | `POST`/`PUT`/`DELETE /api/grocery…` | `grocery.js` | `grocery.tsx` |
| Chef AI | send, quick prompt, "Use my pantry" | `POST /api/chat` | `chat.js` + `aiService.js` | `kitchen.tsx` |
| Chef AI | "Weekly meal plan" | `POST /api/chat` → `kind:"plan"` | `chat.js` + `mealPlanner.js` | `kitchen.tsx`, `plans.tsx` |
| Chef AI | page reload keeps chat | `GET /api/chat` | `chat.js` | `kitchen.tsx` |
| Chef AI | "Clear chat" | `DELETE /api/chat` | `chat.js` | `kitchen.tsx` |
| Plan card | "Save plan" | `POST /api/plans` | `plans.js` | `plans.tsx` |
| Saved tab | list / open / delete plans | `GET /api/plans`, `GET`/`DELETE /api/plans/:id` | `plans.js` | `plans.tsx` |

### Request path (Module 5)
```
Browser (React, port 5173) ──/api/…──▶ Vite proxy ──▶ Express (port 3000) ──▶ MongoDB Atlas
        ▲                                                   │                (Chef AI also calls an LLM)
        └──────────────────────── JSON ─────────────────────┘
```
The browser never opens the database. A refresh reloads rows from MongoDB, which is why data survives (Module 5, "Why refresh works now").

### The AI key (optional)
Chef AI **works without a key**: it still shows recipe cards and says what you have and what is missing. To get real AI sentences, put these in `server/.env` and restart the server:

| Option | `.env` settings |
|---|---|
| Google Gemini (has a free tier; check current limits) | `AI_API_KEY=<key from aistudio.google.com>` · `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai` · `AI_MODEL=<a current model name shown in AI Studio>` |
| OpenAI (as in your synopsis; paid account) | `AI_API_KEY=<key>` · `AI_BASE_URL=https://api.openai.com/v1` · `AI_MODEL=gpt-4o-mini` |

Model names change often; copy the current one from the provider's site. Weekly/daily **plans do not need AI**; our planner builds them.

✅ **Done when:** you can finish checklist items 1–21 in `docs/testing.md`.

---

## Phase 7. Report and viva

**Module mapping**

| Module | Where in this project |
|---|---|
| 2 Front-end | Tailwind CSS (flex/grid, responsive breakpoints), form validation in `auth.tsx` / `addrecipe.tsx`, `map`/`filter`/`sort` in `recipes.tsx` |
| 3 React | components + props (`RecipeCard`, `PlanView`), `useState`, `useEffect` (loading data), `useMemo`, tab-based navigation in `App.tsx`, shared state passed through `ctx` |
| 4 Back-end | Express routes with GET/POST/PUT/DELETE, validation middleware returning 400 `{errors}`, Mongoose models, JWT middleware, `.env` + `.env.example`, `cors()` |
| 5 Integration + GitHub | `client/src/api.ts` holds every fetch, Vite proxy `/api` → 3000, data survives refresh, branches + pull requests |

**Viva one-liners**
- *Why can't the browser talk to MongoDB directly?* Credentials would be exposed. Express is the safe middle layer.
- *How are passwords stored?* Hashed with bcrypt, never in plain text.
- *How does login work?* The server signs a JWT; the browser sends it in the `Authorization` header; `requireAuth` middleware checks it.
- *How does the meal planner work?* Splits your calories over 4 meals, picks dishes by category, diet and allergies, and scales servings (0.5× to 3×). Code: `server/src/utils/mealPlanner.js`.
- *How does Chef AI use my pantry?* The browser sends pantry + diet + time + calories; the server scores recipes by how few ingredients are missing, then (if a key exists) asks the LLM to write the answer.
- *What did you change in the Figma export?* See `docs/figma-integration.md`.

**Honest limitations (put in your report)**
- The CSV has **no** diet type, region, meal type, quantities or steps. Diet type, category, region and meal are **guessed from names/ingredients** (`classify.js`) and can be wrong for some dishes. "Vegan" means "no dairy/egg/meat words in the ingredient list". Jain support is approximate. Allergy filtering is keyword-based, not a medical guarantee.
- Dishes from the CSV have no photo; the UI shows a stock photo of the same *kind* of dish.
- Recipes you add can store a photo (up to 1.5 MB) inside MongoDB, which is simple but not how a large site would do it.
- "Forgot password" does not send e-mail. Google/Apple sign-in were removed.
- Photos are Unsplash links, so the site needs internet.
- Nutrient values are per serving and estimates; the footer states this is not medical advice.

---

## Phase 8. *(Optional)* Put it online

> ⚠️ **This is not in your slides.** Module 5 says *"A public URL is Module 6"*, and Module 6 was not among the files you shared, so ask your teacher whether deployment is required. Your synopsis names Vercel / Render / Netlify; the steps below are the usual way to use them. Free-plan details change, so check each site's current screens.

(Your Module 5 slides say what Module 6 expects you to bring: *a public GitHub repo, already working on localhost*. After Phase 6 you have exactly that.)

1. **Database:** you already have Atlas (Phase 2). Keep *Network Access* at `0.0.0.0/0`.
2. **API on Render:** New → *Web Service* → connect your GitHub repo → **Root Directory:** `server` → **Build Command:** `npm install` → **Start Command:** `npm start` → add environment variables `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, optional `AI_*`, and `CLIENT_URL` (fill in after step 3). Free services usually "sleep" when idle, so the first request can be slow.
3. **Website on Vercel (or Netlify):** import the repo → **Root Directory:** `client` → framework *Vite* → build `npm run build`, output `dist` → environment variable **`VITE_API_URL`** = your Render address (e.g. `https://eat-desi-api.onrender.com`, no trailing slash).
4. Go back to Render and set **`CLIENT_URL`** = your Vercel address (comma-separate to keep localhost too: `http://localhost:5173,https://your-site.vercel.app`). Redeploy the API.
5. The app has no URL routes (it switches tabs inside one page), so refreshing never gives a 404.
6. Never put real keys or the Atlas string in GitHub; paste them in the host's *Environment Variables* screen.

---

## When something goes wrong

| Problem | Fix |
|---|---|
| `npm: command not found` | Install Node LTS, then open a **new** terminal |
| `npm install` in `client` fails with an engine/Node message | Your Node is too old. Install Node 22 LTS |
| `Missing MONGO_URI or JWT_SECRET` | You skipped `copy .env.example .env`, or the file is not inside `server/` |
| `Could not connect to MongoDB` | Wrong password / missing `eatdesi` DB name / Atlas *Network Access* does not allow you / `<` `>` left in the string |
| Website says "Cannot reach the server" or "Could not load recipes" | Terminal 1 (`npm start` in `server`) is not running or not on port 3000 |
| Port 3000 already in use | Close the other Node terminal (Ctrl+C), or change `PORT` in `.env` **and** the proxy in `client/vite.config.ts` |
| Recipes list empty | The seed was never run. One person runs `npm run seed` |
| White screen on the website | Browser DevTools (F12) → Console. Usually a teammate's PR is not merged yet. `git pull origin main` |
| Chef AI says nothing useful | Without an AI key it shows recipe cards plus a short fixed sentence. Normal |
| Photos missing | You are offline (photos are web links) |
| `node_modules` appears in `git status` | **Stop. Do not commit.** Check `.gitignore` exists in the repo root |
| `git push` rejects your password | Use a Personal Access Token (Phase 3 note) or the browser login |
| "Session expired" after changing `.env` | `JWT_SECRET` changed. Log in again |

PowerShell users: use `curl.exe`, not `curl`. You can also test the API in Postman (see `docs/api.md`).

---

## Demo-day checklist ✅
- [ ] All four PRs merged; GitHub → *Insights → Contributors* shows four names
- [ ] Repository is **Public**; no `.env`, no `node_modules` in it
- [ ] `npm test` passes in `server`
- [ ] Both terminals running; log in as a normal user **and** as admin
- [ ] Demo order: Sign up → Recipes (filter + ❤) → Add recipe → Chef AI (pantry → cards → weekly plan → save) → Shopping list → Profile calculator → Theme → Refresh to show data persists
- [ ] Everyone can explain **their own files** and one viva line from Phase 7
