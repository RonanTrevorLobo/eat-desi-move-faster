# API reference

Base URL (development): `http://localhost:3000/api`. The React app calls `/api/...` and Vite forwards it (Module 5 proxy).
🔒 = needs header `Authorization: Bearer <token>` (the token comes from login/register).
Error format: validation problems → HTTP 400 `{ "errors": ["..."] }`; everything else `{ "error": "..." }` with 401 / 403 / 404 / 409 / 500.

## Accounts
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | /auth/register | | `{name,email,password(8+ & a number),diet?,allergies?,kcal?,theme?}` → `{token,user}` |
| POST | /auth/login | | `{email,password}` → `{token,user}` |
| GET | /auth/me | 🔒 | → user |
| PUT | /profile | 🔒 | any of `{diet,allergies,kcal,theme}` → user |
| POST | /profile/calculate | 🔒 | `{age,gender,heightCm,weightKg,activityLevel,goal}` → user with `targets` (and `kcal` set to match) |

## Recipes and favourites
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /recipes | | `?search&category&dietType&zone&maxCalories&page&limit` → `{recipes,total,page,pages}`. The website loads everything with `limit=2000` and filters in the browser. |
| GET | /recipes/mine | 🔒 | Recipes I added |
| GET | /recipes/:id | | One recipe |
| POST | /recipes | 🔒 | Add a recipe (validated; photo may be a base64 data URL < 1.5 MB) |
| PUT | /recipes/:id | 🔒 | Edit (owner or admin) |
| DELETE | /recipes/:id | 🔒 | Delete (owner or admin) |
| GET | /favourites/ids | 🔒 | `["id", ...]` (for the heart buttons) |
| GET | /favourites | 🔒 | Full favourite recipes |
| POST | /favourites/:recipeId | 🔒 | Toggle → `{favourite: true/false}` |

## Shopping list (every route returns the whole updated list)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /grocery | 🔒 | The list `[ {_id,name,qty,cat,from[],done} ]` |
| POST | /grocery | 🔒 | `{name,qty}` add one item (aisle guessed) |
| POST | /grocery/from-recipes | 🔒 | `{recipeIds:[...], only?:[names]}`; duplicates are merged (quantities added, recipe names noted in `from`) |
| PUT | /grocery/:id | 🔒 | `{done:true/false}` |
| DELETE | /grocery/:id | 🔒 | Remove one item |
| DELETE | /grocery | 🔒 | Clear all; `?done=true` clears only ticked items |

## Chef AI and meal plans
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /chat | 🔒 | `{message,pantry[],diet,maxTime,kcal}` → `{kind:'plan'\|'recipes'\|'text', reply, plan?, recipes?}`. Messages containing *plan / week / daily / 7 day* return a meal plan; everything else returns up to 3 recipe cards plus an AI (or fallback) sentence |
| GET | /chat | 🔒 | Saved chat history |
| DELETE | /chat | 🔒 | Clear chat |
| POST | /plans/generate | 🔒 | `{days:1\|7, calories?, diet?, maxTime?}` → plan (not saved). Same planner the chat uses |
| POST | /plans | 🔒 | Save a plan `{name,targetCalories,dietType,days}` |
| GET | /plans | 🔒 | My saved plans (summary) |
| GET | /plans/:id | 🔒 | One plan |
| DELETE | /plans/:id | 🔒 | Delete a plan |
| GET | /health | | `{status:"up"}` |

## Testing with Postman
1. `POST /auth/login` → copy `token` from the response.
2. In any 🔒 request: *Authorization* tab → *Bearer Token* → paste.
