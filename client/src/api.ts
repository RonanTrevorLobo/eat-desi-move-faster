// EVERY call to the server lives in this one file (Module 5: "api.js holds every fetch").
// Screens never write fetch() themselves; they call api.something().
import type { ApiRecipe } from './data'
import type { ThemeId } from './theme'

// In development this is '' and Vite forwards /api to port 3000 (see vite.config.ts).
// When deployed separately, set VITE_API_URL in client/.env.
const BASE = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api`

// ---------- Types of what the server sends ----------
export type Account = {
  _id: string; name: string; email: string; role: 'user' | 'admin'
  diet: string; allergies: string[]; kcal: number; theme: ThemeId
  body?: { age?: number; gender?: 'male' | 'female'; heightCm?: number; weightKg?: number; activityLevel?: string; goal?: string }
  targets?: { bmr: number; tdee: number; calories: number; protein: number; carbs: number; fat: number }
}
export type GItem = { id: string; name: string; qty: string; cat: string; done: boolean; from: string[] }
type ApiGrocery = { _id: string; name: string; qty: string; cat: string; done: boolean; from: string[] }

export type PlanItem = { recipeId: string; name: string; category: string; servings: number; calories: number; protein: number; carbs: number; fat: number; fibre: number }
export type PlanDay = { day: number; meals: { slot: string; items: PlanItem[] }[]; totals: { calories: number; protein: number; carbs: number; fat: number; fibre: number } }
export type ApiPlan = { _id?: string; name: string; targetCalories: number; dietType: string; days: PlanDay[]; createdAt?: string }

export type ChatReply = { kind: 'text' | 'recipes' | 'plan'; reply: string; recipes?: ApiRecipe[]; plan?: ApiPlan }
export type ChatRow = { role: 'user' | 'assistant'; content: string; kind: 'text' | 'recipes' | 'plan'; recipeIds: string[]; plan: ApiPlan | null }

export type BodyStats = { age: number; gender: 'male' | 'female'; heightCm: number; weightKg: number; activityLevel: string; goal: string }

// ---------- The one function that talks to the server ----------
async function request<T>(path: string, { method = 'GET', body }: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new Error('Cannot reach the server. Is it running on port 3000?')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // The server sends either { errors: [...] } or { error: '...' }
    throw new Error(data.errors ? data.errors.join(' • ') : data.error || 'Something went wrong')
  }
  return data as T
}

const toG = (d: ApiGrocery): GItem => ({ id: d._id, name: d.name, qty: d.qty, cat: d.cat, done: d.done, from: d.from })
const grocery = (p: Promise<ApiGrocery[]>) => p.then((list) => list.map(toG))

export const api = {
  // ----- accounts -----
  async register(body: { name: string; email: string; password: string; diet: string; allergies: string[]; kcal: number; theme: string }) {
    const data = await request<{ token: string; user: Account }>('/auth/register', { method: 'POST', body })
    localStorage.setItem('token', data.token)
    return data.user
  },
  async login(email: string, password: string) {
    const data = await request<{ token: string; user: Account }>('/auth/login', { method: 'POST', body: { email, password } })
    localStorage.setItem('token', data.token)
    return data.user
  },
  me: () => request<Account>('/auth/me'),
  logout: () => localStorage.removeItem('token'),
  hasToken: () => !!localStorage.getItem('token'),
  saveProfile: (body: Partial<Pick<Account, 'diet' | 'allergies' | 'kcal' | 'theme'>>) => request<Account>('/profile', { method: 'PUT', body }),
  calculateProfile: (body: BodyStats) => request<Account>('/profile/calculate', { method: 'POST', body }),

  // ----- recipes -----
  getRecipes: () => request<{ recipes: ApiRecipe[] }>('/recipes?limit=2000').then((d) => d.recipes),
  createRecipe: (body: unknown) => request<ApiRecipe>('/recipes', { method: 'POST', body }),
  updateRecipe: (id: string, body: unknown) => request<ApiRecipe>(`/recipes/${id}`, { method: 'PUT', body }),
  deleteRecipe: (id: string) => request<{ ok: true }>(`/recipes/${id}`, { method: 'DELETE' }),

  // ----- favourites (the hearts) -----
  getFavouriteIds: () => request<string[]>('/favourites/ids'),
  toggleFavourite: (id: string) => request<{ favourite: boolean }>(`/favourites/${id}`, { method: 'POST' }),

  // ----- shopping list (every call returns the whole updated list) -----
  getGrocery: () => grocery(request<ApiGrocery[]>('/grocery')),
  addGrocery: (name: string, qty: string) => grocery(request<ApiGrocery[]>('/grocery', { method: 'POST', body: { name, qty } })),
  addRecipesToGrocery: (recipeIds: string[], only?: string[]) => grocery(request<ApiGrocery[]>('/grocery/from-recipes', { method: 'POST', body: { recipeIds, only } })),
  toggleGrocery: (id: string, done: boolean) => grocery(request<ApiGrocery[]>(`/grocery/${id}`, { method: 'PUT', body: { done } })),
  removeGrocery: (id: string) => grocery(request<ApiGrocery[]>(`/grocery/${id}`, { method: 'DELETE' })),
  clearGrocery: (onlyDone: boolean) => grocery(request<ApiGrocery[]>(`/grocery${onlyDone ? '?done=true' : ''}`, { method: 'DELETE' })),

  // ----- Chef AI -----
  getChat: () => request<ChatRow[]>('/chat'),
  sendChat: (body: { message: string; pantry: string[]; diet: string; maxTime: number; kcal: number }) => request<ChatReply>('/chat', { method: 'POST', body }),
  clearChat: () => request<{ ok: true }>('/chat', { method: 'DELETE' }),

  // ----- saved meal plans -----
  savePlan: (plan: ApiPlan) => request<ApiPlan>('/plans', { method: 'POST', body: plan }),
  getPlans: () => request<ApiPlan[]>('/plans'),
  getPlan: (id: string) => request<ApiPlan>(`/plans/${id}`),
  deletePlan: (id: string) => request<{ ok: true }>(`/plans/${id}`, { method: 'DELETE' }),
}
