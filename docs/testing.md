# Testing

## 1. Automated tests (server logic)
```bash
cd server
npm test
```
23 tests with Node's built-in test runner (no extra library):
- `calories.test.js`: BMR / calorie / macro formula
- `classify.test.js`: diet type, category, region and meal guessing
- `aisle.test.js`: shopping-aisle guessing
- `mealPlanner.test.js`: 4 meals a day, 7 days a week, servings 0.5–3, max cooking time, diet rules
- `chat-utils.test.js`: allergy filter and pantry matching

## 2. Manual test checklist (do this before the demo)
Start both terminals first (API on 3000, website on 5173).

| # | Steps | Expected |
|---|---|---|
| 1 | Welcome → Create account → enter a 5-letter password → Continue | Red message: use 8+ characters and a number |
| 2 | Finish the 3 steps (pick *Vegetarian*, allergy *Dairy*, 1800 kcal, a theme) → Start cooking | "You're in" screen → Chef AI opens |
| 3 | Refresh the page | Still logged in (token + `/auth/me`) |
| 4 | Log out, then sign up again with the same email | "An account with this email already exists" |
| 5 | Recipes tab → type "paneer" | Only paneer dishes; counter updates |
| 6 | Filters → Diet *Vegan*, max 30 min → Apply | Only vegan dishes ≤ 30 min; chips show the filters |
| 7 | Tap a ❤ on 2 recipes → Saved tab → refresh | Both are still there (stored in MongoDB) |
| 8 | Add Recipe: leave the name empty → Next | Error under the field, stays on step 1 |
| 9 | Add a full recipe with a photo → Save | "Recipe added!" → appears under *My recipes* → refresh: still there |
| 10 | Edit it (⋯ menu), then delete it | Changes show; deleted recipe is gone after refresh |
| 11 | Chef AI: add *onion, tomato* → "Use my pantry" | 3 recipe cards with green "have" chips and grey "missing" chips |
| 12 | "Add missing items to shopping list" → cart icon | Items grouped by aisle; badge number matches |
| 13 | Tick items, remove one, "Clear picked", refresh | State survives the refresh |
| 14 | Chef AI → "Weekly meal plan" | Plan card with Day 1–7 chips, kcal near your goal |
| 15 | "Save plan" → Saved tab | Plan appears under *Saved meal plans*; Open / Delete work |
| 16 | Type `/error` in Chef AI | Red error bubble with *Try again* |
| 17 | Chef AI → "Clear chat" → refresh | Chat is empty; before clearing it came back after a refresh |
| 18 | Profile → Dietary preferences → enter age/height/weight → Calculate my target | Calories and macros appear, slider jumps to the new value |
| 19 | Pick another theme with the 🎨 button; log out and log in | Theme is remembered |
| 20 | Continue as guest → tap a ❤ | Message "Log in to save recipes", then the login screen |
| 21 | Stop the API → open Recipes after a reload | "Could not load recipes" with *Try again* |
