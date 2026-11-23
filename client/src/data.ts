export type Diet = 'vegan' | 'veg' | 'egg' | 'nonveg'
export type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
export type Cat = 'Produce' | 'Dairy' | 'Grains & Pulses' | 'Spices' | 'Protein' | 'Pantry'
export interface Recipe {
  id: string; name: string; region: string; zone: string; diet: Diet; meal: Meal
  time: number; kcal: number; p: number; c: number; f: number
  ing: [string, string, Cat][]; steps: string[]; img?: string; tone: string
  mine?: boolean; jain?: boolean; est?: boolean; fibre?: number; sodium?: number; servings?: number
  featured?: boolean
  rawImg?: string // the photo really stored in the database ('' = none, `img` is then a placeholder)
}

// ---------------------------------------------------------------------------------------------
// The recipes now come from the database (GET /api/recipes). This is the shape the API sends.
// ---------------------------------------------------------------------------------------------
export interface ApiRecipe {
  _id: string; name: string; zone: string; region: string; category: string; meal: Meal; dietType: string
  calories: number; protein: number; carbs: number; fat: number; fibre: number; sodium: number
  ingredients: { name: string; qty: string; cat: string }[]; steps: string[]
  timeMinutes: number; servings: number; estimated: boolean; img: string; featured: boolean; createdBy: string | null
}

const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

// Photos for recipes that have none (most dataset dishes). They are only illustrations of the
// KIND of dish (breakfast, curry, dessert...), not a photo of that exact dish.
const FOOD: Record<string, string> = {
  thepla: '1542367592-8849eb950fd8', poha: '1789991184412-c29c9dfa2b39', idli: '1632104667384-06f58cb7ad44', chilla: '1585937421612-70a008356fbe',
  bhurji: '1631880383152-f29099b0fd16', rajma: '1516714435131-44d6b64dc6a2', palak: '1631452180519-c014fe946bc7', chana: '1589778655375-3e622a9fc91c',
  tikka: '1599487488170-d11ec9c172f0', khichdi: '1755090154817-58d9d36ec988', bisi: '1697155406121-85aac6236000', fish: '1620894580123-466ad3a0ca06',
  'egg-roast': '1680993032090-1ef7ea9b51e5', dhokla: '1588644525273-f37b60d78512', chaat: '1758721217610-a5d729a319e9', halwa: '1610432589024-5f02f76549cf',
  shrikhand: '1591353692625-9b49f8fac18d', pavbhaji: '1753357303396-704b5abe8945', jhol: '1727404679933-99daa2a7573a', quinoa: '1623428187969-5da2dcea5ebf',
  lemon: '1608322368735-b6b6ec262af7',
}
const FALLBACK: Record<string, string[]> = {
  Breakfast: ['poha', 'idli', 'chilla', 'thepla', 'bhurji'],
  Main: ['rajma', 'palak', 'chana', 'pavbhaji', 'khichdi', 'bisi'],
  'Main-nonveg': ['tikka', 'fish', 'jhol', 'egg-roast'],
  Staple: ['thepla', 'khichdi', 'rajma', 'bisi'],
  Snack: ['dhokla', 'chaat', 'pavbhaji'],
  Dessert: ['halwa', 'shrikhand'],
  Beverage: ['lemon', 'shrikhand'],
  Soup: ['khichdi', 'chana'],
  Side: ['chaat', 'quinoa'],
  Other: ['chaat', 'quinoa'],
}
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const fallbackImg = (r: ApiRecipe) => {
  const key = r.category === 'Main' && r.dietType === 'Non-Veg' ? 'Main-nonveg' : r.category
  const list = FALLBACK[key] ?? FALLBACK.Other
  return u(FOOD[list[hash(r.name) % list.length]])
}

/** API recipe -> the shape every Figma component already understands */
export function toUi(r: ApiRecipe, userId?: string): Recipe {
  const diet: Diet = r.dietType === 'Vegan' ? 'vegan' : r.dietType === 'Eggetarian' ? 'egg' : r.dietType === 'Non-Veg' ? 'nonveg' : 'veg'
  return {
    id: r._id, name: r.name, region: r.region || r.zone, zone: r.zone, diet, jain: r.dietType === 'Jain', meal: r.meal,
    time: r.timeMinutes, kcal: Math.round(r.calories), p: Math.round(r.protein), c: Math.round(r.carbs), f: Math.round(r.fat),
    ing: r.ingredients.map((i) => [i.name, i.qty, i.cat as Cat]), steps: r.steps, img: r.img || fallbackImg(r), rawImg: r.img, tone: '#FF8A1F',
    mine: !!userId && r.createdBy === userId, est: r.estimated, servings: r.servings, featured: r.featured,
    fibre: r.fibre > 0 ? Math.round(r.fibre * 10) / 10 : undefined, sodium: r.sodium > 0 ? Math.round(r.sodium) : undefined,
  }
}

/** UI recipe (from the Add Recipe form) -> body for POST/PUT /api/recipes */
export const fromUi = (r: Recipe) => ({
  name: r.name, zone: r.zone, region: r.region, meal: r.meal, timeMinutes: r.time, servings: r.servings ?? 1,
  dietType: r.jain ? 'Jain' : r.diet === 'vegan' ? 'Vegan' : r.diet === 'egg' ? 'Eggetarian' : r.diet === 'nonveg' ? 'Non-Veg' : 'Vegetarian',
  calories: r.kcal, protein: r.p, carbs: r.c, fat: r.f, fibre: r.fibre ?? 0, sodium: r.sodium ?? 0,
  ingredients: r.ing.map(([name, qty]) => ({ name, qty })), steps: r.steps, img: r.img ?? '', estimated: !!r.est,
})

export const ZONES = ['North Indian', 'South Indian', 'East Indian', 'West Indian', 'Continental', 'Street Food', 'Desserts']
export const PHOTO = {
  thali: u('1742281257687-092746ad6021', 1600), jog: u('1603455778956-d71832eafa4e', 1400), yoga: u('1544367567-0f2fcb009e0b', 1200),
  stretch: u('1524863479829-916d8e77f114', 1200), cycle: u('1541625602330-2277a4c46182', 1200), cook: u('1636647511729-6703539ba71f', 1400),
  fruit: u('1490474418585-ba9bad8fd0ea', 1000), spices: u('1486548730767-5c679e8eda6b', 1000), sprouts: u('1758721217610-a5d729a319e9', 1000),
  chilli: u('1583119022894-919a68a3d0e3', 400), lemon: u('1608322368735-b6b6ec262af7', 400), tomato: u('1582284540020-8acbe03f4924', 400),
  mint: u('1618130070080-91f4d55a2383', 400), turmeric: u('1486548730767-5c679e8eda6b', 400),
}
export const DIETS = ['Vegetarian', 'Non-Veg', 'Vegan', 'Eggetarian', 'Jain']
const ROOT = /onion|garlic|potato|carrot|ginger/i
export const dietOk = (r: Pick<Recipe, 'diet' | 'ing' | 'jain'>, pref: string) => {
  const d = r.diet
  switch (pref) {
    case 'Vegan': return d === 'vegan'
    case 'Vegetarian': return d === 'vegan' || d === 'veg'
    case 'Eggetarian': return d !== 'nonveg'
    case 'Jain': return !!r.jain || ((d === 'vegan' || d === 'veg') && !r.ing.some((i) => ROOT.test(i[0])))
    default: return true
  }
}

export const CATALOG: Record<string, string[]> = {
  Vegetables: ['onion', 'tomato', 'spinach', 'potato', 'carrot', 'cauliflower', 'peas', 'capsicum', 'cucumber', 'okra', 'brinjal', 'green chilli', 'ginger', 'garlic', 'lemon', 'curry leaves', 'coriander', 'fenugreek leaves'],
  'Dals and Grains': ['toor dal', 'moong dal', 'chana dal', 'masoor dal', 'rajma', 'chickpeas', 'rice', 'basmati rice', 'atta', 'poha', 'gram flour', 'oats', 'quinoa', 'semolina'],
  Dairy: ['paneer', 'curd', 'milk', 'ghee', 'butter', 'cream'],
  Spices: ['turmeric', 'cumin', 'garam masala', 'coriander powder', 'red chilli powder', 'mustard seeds', 'cardamom', 'chaat masala', 'sambar powder'],
  Proteins: ['eggs', 'chicken breast', 'fish fillets', 'tofu', 'soya chunks', 'sprouts', 'peanuts'],
}
export const ALL_ING = Object.values(CATALOG).flat()
const CAT_MAP: Record<string, Cat> = { Vegetables: 'Produce', 'Dals and Grains': 'Grains & Pulses', Dairy: 'Dairy', Spices: 'Spices', Proteins: 'Protein' }
export const catOf = (name: string): Cat => {
  const k = Object.keys(CATALOG).find((c) => CATALOG[c].includes(name.toLowerCase()))
  return k ? CAT_MAP[k] : 'Pantry'
}
const ALIAS: Record<string, string[]> = {
  atta: ['whole wheat flour'], palak: ['spinach'], dahi: ['curd', 'hung curd'], besan: ['gram flour'], eggs: ['egg'], egg: ['eggs'],
  'toor dal': ['toor dal'], 'chana dal': ['chickpeas'], 'green chilli': ['chilli'], 'fish fillets': ['fish'], 'chicken breast': ['chicken'], oats: ['oat'],
}
export const STAPLE = /^(oil|coconut oil|olive oil|mustard oil|salt|water)$/i
export const has = (pantry: string[], ing: string) => {
  const n = ing.toLowerCase()
  return pantry.some((raw) => {
    const p = raw.toLowerCase().trim()
    return !!p && [p, ...(ALIAS[p] || [])].some((x) => n.includes(x) || (x.length > 3 && x.includes(n)))
  })
}
export const matchInfo = (r: Recipe, pantry: string[]) => {
  const ings = r.ing.filter((i) => !STAPLE.test(i[0]))
  const haveL = ings.filter((i) => has(pantry, i[0])).map((i) => i[0])
  return { have: haveL, missing: ings.filter((i) => !haveL.includes(i[0])).map((i) => i[0]), total: ings.length }
}
