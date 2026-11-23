import { useCallback, useEffect, useMemo, useState } from 'react'
import { PHOTO, fromUi, toUi, type ApiRecipe, type Recipe } from './data'
import { api, type Account, type BodyStats, type GItem } from './api'
import { AddRecipe } from './addrecipe'
import { Home } from './home'
import { Kitchen } from './kitchen'
import { Bento, Recipes } from './recipes'
import { Settings, ThemePicker } from './settings'
import { Auth } from './auth'
import { Profile } from './profile'
import { GrocerySheet, type GroceryOps } from './grocery'
import { SavedPlans } from './plans'
import { RecipeDetail, type Ctx, type Tab } from './shared'
import { THEMES, type Mode, type ThemeId } from './theme'
import { Button, Card, Chip, Icon, IconButton, Sheet } from './ui'

// Only small UI preferences stay in the browser. Everything else now lives in the database.
function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : init } catch { return init } })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV] as const
}
const TABS: [Tab, string, string][] = [['chef', 'Chef AI', 'chat'], ['recipes', 'Recipes', 'book'], ['add', 'Add Recipe', 'plus'], ['saved', 'Saved', 'heart']]

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [user, setUser] = useState<Account | null>(null)             // who is logged in (from the server)
  const [booting, setBooting] = useState(() => api.hasToken())       // true while we check a saved login token
  const [guest, setGuest] = useStored<boolean>('guest', false)
  const [theme, setTheme] = useStored<ThemeId>('theme', 'sun')
  const [mode, setMode] = useStored<Mode>('mode', 'dark')
  const [raw, setRaw] = useState<ApiRecipe[]>([])                    // recipes exactly as the API sends them
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [favs, setFavs] = useState<string[]>([])                     // ids of my favourite recipes
  const [grocery, setGrocery] = useState<GItem[]>([])
  const [pantry, setPantry] = useStored<string[]>('pantry', [])
  const [open, setOpen] = useState<Recipe | null>(null)
  const [cart, setCart] = useState(false); const [themeSheet, setThemeSheet] = useState(false)
  const [editing, setEditing] = useState<Recipe | undefined>(); const [formKey, setFormKey] = useState(0)
  const [toast, setToast] = useState(''); const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const h = document.documentElement
    h.classList.add('theming'); h.dataset.theme = theme; h.dataset.mode = mode
    const t = setTimeout(() => h.classList.remove('theming'), 600); return () => clearTimeout(t)
  }, [theme, mode])
  useEffect(() => {
    let last = 0
    const f = () => { const y = scrollY; if (y > 80 && y > last) setExpanded(false); last = y }
    addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f)
  }, [])

  // 1. Load all recipes from the database (GET /api/recipes). Anyone may see them, even guests.
  const loadRecipes = useCallback(() => {
    setStatus('loading')
    api.getRecipes().then((list) => { setRaw(list); setStatus('ready') }).catch(() => setStatus('error'))
  }, [])
  useEffect(() => { loadRecipes() }, [loadRecipes])

  // 2. If a login token is saved, ask the server who it belongs to (GET /api/auth/me)
  useEffect(() => {
    if (!api.hasToken()) return
    api.me().then((u) => { setUser(u); setTheme(u.theme) }).catch(() => api.logout()).finally(() => setBooting(false))
  }, [])

  // 3. When someone logs in, load THEIR favourites and shopping list. When they log out, clear them.
  useEffect(() => {
    if (!user) { setFavs([]); setGrocery([]); return }
    api.getFavouriteIds().then(setFavs).catch(() => {})
    api.getGrocery().then(setGrocery).catch(() => {})
  }, [user?._id])

  const recipes = useMemo(() => raw.map((r) => toUi(r, user?._id)), [raw, user?._id])
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 2400) }
  // Guests can browse, but saving things needs an account: show a message, then the login screen
  const needLogin = (msg: string) => { say(msg); setTimeout(() => setGuest(false), 1300) }
  const fail = (e: unknown) => say(e instanceof Error ? e.message : 'Something went wrong')

  const saveRecipe = async (r: Recipe): Promise<Recipe> => {
    const body = fromUi(r)
    const exists = raw.some((x) => x._id === r.id)
    const saved = exists ? await api.updateRecipe(r.id, body) : await api.createRecipe(body)  // PUT or POST /api/recipes
    setRaw((list) => (exists ? list.map((x) => (x._id === saved._id ? saved : x)) : [saved, ...list]))
    return toUi(saved, user?._id)
  }

  const ctx: Ctx = {
    recipes, favs, pantry, status, reload: loadRecipes, loggedIn: !!user, say, isFav: (id) => favs.includes(id),
    toggleFav: (id) => {
      if (!user) return needLogin('Log in to save recipes')
      const had = favs.includes(id)
      setFavs((f) => (had ? f.filter((x) => x !== id) : [...f, id]))               // update the heart at once...
      api.toggleFavourite(id).catch((e) => { setFavs((f) => (had ? [...f, id] : f.filter((x) => x !== id))); fail(e) }) // ...undo if the server says no
    },
    addToGrocery: (rs, only) => {
      if (!user) return needLogin('Log in to build a shopping list')
      api.addRecipesToGrocery(rs.map((r) => r.id), only).then((list) => { setGrocery(list); say('Added to shopping list') }).catch(fail)
    },
    openRecipe: setOpen,
    editRecipe: (r) => { setEditing(r); setFormKey((k) => k + 1); setTab('add'); scrollTo({ top: 0 }) },
    deleteRecipe: (id) => {
      api.deleteRecipe(id).then(() => { setRaw((l) => l.filter((r) => r._id !== id)); setFavs((f) => f.filter((x) => x !== id)); say('Recipe deleted') }).catch(fail)
    },
    go: (t) => { if (t === 'add') { setEditing(undefined); setFormKey((k) => k + 1) } setTab(t); scrollTo({ top: 0 }) },
  }
  const groceryOps: GroceryOps = {
    add: (name, qty) => (user ? api.addGrocery(name, qty).then(setGrocery).catch(fail) : needLogin('Log in to build a shopping list')),
    toggle: (id, done) => api.toggleGrocery(id, done).then(setGrocery).catch(fail),
    remove: (id) => api.removeGrocery(id).then(setGrocery).catch(fail),
    clear: (onlyDone) => api.clearGrocery(onlyDone).then(setGrocery).catch(fail),
  }
  const gate = (msg: string) => (
    <Card className="max-w-lg mx-auto p-8 text-center space-y-4"><h2 className="text-4xl">Log in first</h2><p className="font-medium text-smute">{msg}</p><Button onClick={() => setGuest(false)}>Log in or create account</Button></Card>
  )

  const pending = grocery.filter((g) => !g.done).length
  const saved = favs.map((id) => recipes.find((r) => r.id === id)).filter(Boolean) as Recipe[]
  const vegCount = recipes.filter((r) => r.diet === 'veg' || r.diet === 'vegan').length

  const login = (a: Account) => { setUser(a); setGuest(false); setTheme(a.theme); setTab('chef'); scrollTo({ top: 0 }) }
  const logout = () => { api.logout(); setUser(null); setGuest(false); setTab('home'); scrollTo({ top: 0 }) }
  if (booting) return <div className="min-h-screen grid place-items-center bg-bg text-fg font-display text-5xl" role="status">Loading…</div>
  if (!user && !guest) return <Auth onLogin={login} onGuest={() => { setGuest(true); setTab('home') }} theme={theme} setTheme={setTheme} mode={mode} />
  const initials = user ? user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : ''

  return (
    <div className="min-h-screen pb-28 md:pb-0 bg-bg text-fg">
      <header className="sticky top-0 z-40 bg-hd text-hdfg border-b-4 border-ac">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="h-16 flex items-center gap-1 md:gap-2">
            <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label="Toggle header details" className="md:hidden size-11 -ml-2 grid place-items-center"><span className={`transition ${expanded ? 'rotate-180' : ''}`}><Icon n="chevron" /></span></button>
            <button onClick={() => ctx.go('home')} className="flex-1 md:flex-none text-left font-display text-2xl md:text-3xl leading-none truncate md:mr-4" aria-label="Home">AI Indian Meal Prep <span className="text-ac">Planner</span></button>
            <nav className="hidden md:flex flex-1 gap-1.5" aria-label="Main">
              {TABS.map(([id, l]) => <button key={id} onClick={() => ctx.go(id)} aria-current={tab === id} className={`min-h-11 px-4 rounded-full text-base font-extrabold border-2 transition-all active:scale-95 ${tab === id ? 'bg-ac text-acfg border-ink' : 'border-transparent hover:border-hdfg/60'}`}>{l}</button>)}
            </nav>
            <IconButton label="Shopping list" onClick={() => setCart(true)} className="relative"><Icon n="cart" />{pending > 0 && <span className="absolute top-0.5 right-0 min-w-5 h-5 px-1 rounded-full bg-ac text-acfg text-xs font-extrabold grid place-items-center border border-ink">{pending}</span>}</IconButton>
            <IconButton label="Theme" onClick={() => setThemeSheet(true)}><Icon n="palette" /></IconButton>
            <button onClick={() => ctx.go('profile')} aria-label="Profile" aria-current={tab === 'profile'} className="size-12 shrink-0 rounded-full bg-ac text-acfg border-2 border-ink font-display text-lg grid place-items-center active:scale-90 transition">{user ? initials : <Icon n="user" />}</button>
          </div>
          {expanded && tab !== 'home' && (
            <div className="pb-3 flex items-center justify-between gap-4 md:hidden">
              <p className="text-sm text-hdfg/85 max-w-[15rem]">Balanced Indian meal plans from your pantry.</p>
              <dl className="flex gap-4">{[[recipes.length, 'Recipes'], [vegCount, 'Veg']].map(([n, l]) => <div key={l}><dd className="font-display text-2xl leading-none">{n}</dd><dt className="text-[10px] uppercase tracking-widest font-bold">{l}</dt></div>)}</dl>
            </div>)}
        </div>
      </header>

      {tab === 'home' && <Home ctx={ctx} />}
      <main className={`max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 ${tab === 'home' ? 'hidden' : ''}`}>
        <div hidden={tab !== 'chef'}>
          <div className="mb-6"><h2 className="text-5xl md:text-7xl leading-[.9]">Chef AI<br className="md:hidden" /> Kitchen</h2></div>
          {user ? <Kitchen key={`${user.diet}-${user.kcal}`} ctx={ctx} pantry={pantry} setPantry={setPantry} initDiet={user.diet} initKcal={user.kcal} /> : gate('Chef AI saves your chat, diet and goals to your account.')}
        </div>
        <div hidden={tab !== 'recipes'}><Recipes ctx={ctx} /></div>
        <div hidden={tab !== 'add'}>
          {user ? <AddRecipe key={formKey} editing={editing} ctx={ctx} onSave={saveRecipe}
            onDone={() => { setEditing(undefined); setTab('recipes'); scrollTo({ top: 0 }) }} /> : gate('Sign in to add and edit your own recipes.')}
        </div>
        <div hidden={tab !== 'saved'}>
          <div className="mb-6 flex items-end justify-between gap-3 flex-wrap"><div><span className="font-display text-6xl outline-num leading-none">♥</span><h2 className="text-5xl md:text-7xl leading-[.9]">Saved meals</h2></div>
            {saved.length > 1 && <Button variant="dark" onClick={() => ctx.addToGrocery(saved)}>Add all to shopping list</Button>}</div>
          {saved.length === 0 ? (
            <div className="relative border-[3px] border-dashed border-fg rounded-3xl p-10 text-center space-y-3 overflow-hidden"><img src={PHOTO.fruit} alt="" className="absolute inset-0 size-full object-cover opacity-15" />
              <p className="relative font-display text-5xl">Nothing saved yet</p><p className="relative text-mute font-medium">Tap the heart on any recipe to keep it here.</p><Button className="relative" onClick={() => ctx.go('recipes')}>Browse recipes</Button></div>
          ) : <Bento list={saved} ctx={ctx} />}
          <SavedPlans ctx={ctx} active={tab === 'saved'} />
        </div>
        <div hidden={tab !== 'profile'}>
          <Profile key={user?._id ?? 'guest'} user={user} ctx={ctx} savedCount={saved.length} mineCount={recipes.filter((r) => r.mine).length} theme={theme} onTheme={() => setThemeSheet(true)}
            onSave={(p) => api.saveProfile(p).then((u) => { setUser(u); say('Preferences saved') }).catch(fail)}
            onCalculate={async (b: BodyStats) => { const u = await api.calculateProfile(b); setUser(u); return u }} onLogout={logout} onAuth={logout} />
        </div>
        <div hidden={tab !== 'settings'}><Settings theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} /></div>
      </main>

      <footer className="bg-hd text-hdfg border-t-4 border-ac px-4 md:px-6 py-8 mb-0 mt-8 text-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-3"><span className="font-display text-2xl">Fueled by desi food</span><span className="max-w-md text-hdfg/80">Nutrition values are approximate per serving and not medical advice.</span></div>
      </footer>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-hd text-hdfg border-t-4 border-ac grid grid-cols-4 gap-1 p-1.5 pb-[max(.375rem,env(safe-area-inset-bottom))]" aria-label="Main">
        {TABS.map(([id, l, ic]) => (
          <button key={id} onClick={() => ctx.go(id)} aria-current={tab === id} className={`min-h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[13px] font-extrabold transition-all active:scale-90 ${tab === id ? 'bg-ac text-acfg border-2 border-ink -translate-y-1 shadow-[2px_3px_0_var(--sh)]' : ''}`}>
            <Icon n={ic} filled={tab === id && id === 'saved'} />{l}</button>))}
      </nav>

      <RecipeDetail r={open} ctx={ctx} onClose={() => setOpen(null)} />
      <GrocerySheet open={cart} onClose={() => setCart(false)} grocery={grocery} ops={groceryOps} />
      <Sheet open={themeSheet} onClose={() => setThemeSheet(false)} title="Theme" side>
        <ThemePicker compact theme={theme} setTheme={(t) => { setTheme(t); if (user) api.saveProfile({ theme: t }).then(setUser).catch(() => {}) }} mode={mode} setMode={setMode} onSettings={() => { setThemeSheet(false); ctx.go('settings') }} />
      </Sheet>
      {toast && <div role="status" className="rise fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 bg-ac text-acfg border-2 border-ink shadow-[4px_4px_0_var(--sh)] px-5 py-3 rounded-full font-extrabold z-[60]">{toast}</div>}
    </div>
  )
}
