# Eat Desi, Move Faster 🍛
### An AI-Powered Nutrition and Diet Chatbot for Indian food

FSD Mini Project · B.M.S. College of Engineering · Group 2 · SDG 3 (Good Health) & SDG 12 (Responsible Consumption)

**Team:** Ronan Trevor Lobo · Rinku Seervi · Ratan Chavan · S Himashree
**Guide:** Pavithra M N

## What it does
- Sign up in 3 steps (account → diet & allergies & calorie goal → theme) and log in (JWT)
- **Chef AI** chatbot: tell it your pantry, diet and time; get recipe cards that show what you have and what is missing
- **Daily / weekly meal plans** that match your calorie goal, diet and allergies; save them
- **Recipe database** of 1,000+ Indian dishes (search, region/diet/time/calorie filters, favourites, add / edit / delete your own)
- **Shopping list** grouped by aisle, built from any recipe or plan
- 4 colour themes × light/dark, works on phones (bottom navigation) and desktop

## Tech stack (MERN)
| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 (UI designed in Figma Make) |
| Backend | Node.js + Express 5 (REST API) |
| Database | MongoDB (Atlas) with Mongoose |
| AI | Any OpenAI-compatible chat API (OpenAI, Gemini, …); works without a key too |
| Auth | bcrypt password hashing + JWT tokens |

## Folder map
```
client/    React app   http://localhost:5173
  src/       the screens (one file per screen) + api.ts (every server call)
server/    Express API http://localhost:3000
  data/      Indian_Food_Nutrition_Updated.csv + featured_recipes.json
docs/      API list, database design, testing, Figma integration notes
PHASE_GUIDE.md   ← step-by-step guide, start here
```

## Run it (short version; the full steps are in PHASE_GUIDE.md)
```bash
# Terminal 1: API
cd server
npm install
copy .env.example .env      # Mac/Linux: cp .env.example .env   then edit .env
npm run seed                # loads the recipes into MongoDB (once)
npm start

# Terminal 2: website
cd client
npm install
npm run dev                 # open http://localhost:5173
```
Admin login after seeding: `admin@eatdesi.com` / `Admin@123` (change in `.env`).

## Disclaimer
General nutrition guidance only. Not a substitute for a doctor or registered dietitian.
