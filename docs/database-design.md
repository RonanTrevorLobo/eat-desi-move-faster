# Database design (MongoDB)

Database name: `eatdesi`. Five collections. (Field names are the same ones the React screens use.)

## users
| Field | Notes |
|---|---|
| name, email (unique), passwordHash | password hashed with bcrypt, never sent to the browser |
| role | `user` / `admin` |
| diet, allergies[], kcal, theme | chosen at sign-up, editable on the Profile screen |
| body {age, gender, heightCm, weightKg, activityLevel, goal} | optional, used by "Calculate my target" |
| targets {bmr, tdee, calories, protein, carbs, fat} | calculated (`utils/calories.js`) |
| favourites [ObjectId → recipes] | the hearts |

## recipes  (21 featured + 1,014 from the CSV + user-added)
`name, zone, region, category, meal, dietType, calories, protein, carbs, fat, fibre, sugar, sodium, calcium, iron, vitaminC, folate` (per serving), `ingredients [{name, qty, cat}]`, `steps []`, `timeMinutes, servings, estimated, img, featured, createdBy` (null = seeded, else the user).
- `zone` = the region chips (North/South/East/West Indian, Continental, Street Food, Desserts)
- `category` = what the meal planner uses (Breakfast, Main, Staple, Snack, Side, Soup, Dessert, Beverage, Other)
- `meal` = the Breakfast/Lunch/Dinner/Snack label shown on the card
- `ingredients.cat` = shopping-list aisle (Produce, Grains & Pulses, Dairy, Spices, Protein, Pantry)
- `img` = photo URL or small base64 image; empty means the UI shows a placeholder photo of that kind of dish

## plans
user, name, targetCalories, dietType, `days[] → meals[] → items[]` (a *snapshot*: name + numbers copied from the recipe, so a plan never breaks if a recipe is edited).

## chats
One document per user: `messages[] {role, content, kind: text|recipes|plan, recipeIds[], plan, createdAt}` (last 60 kept).

## groceries
user, name, qty, cat (aisle), from[] (recipe names), done.

## Relationships
```
users 1 ──── * plans          users 1 ──── 1 chats        users 1 ──── * groceries
users * ──── * recipes (favourites)        users 1 ──── * recipes (createdBy)
```

## Where the data comes from (`server/src/scripts/seed.js`)
1. **featured_recipes.json**: the 21 hand-written recipes from the Figma design (quantities, steps, photos).
2. **Indian_Food_Nutrition_Updated.csv**: 1,014 dishes with only a name, nutrients, ingredients and time. It has **no** diet type, region, meal type or steps, so `utils/classify.js` **guesses** them with keyword rules (meat/fish → Non-Veg, egg → Eggetarian, dairy words → Vegetarian, otherwise Vegan; category/zone/meal from the dish name). `utils/aisle.js` guesses each ingredient's aisle.

For the supplied CSV the guesses give: Breakfast 69 · Snack 149 · Beverage 59 · Soup 51 · Staple 66 · Main 218 · Side 70 · Dessert 235 · Other 97 (pickles, sauces, masalas; ignored by the planner). These are estimates; list that under *Limitations* in your report.
