import { useState } from 'react'
import { matchInfo, type Recipe } from './data'
import { Button, Icon, Ring, RING_COLORS, Sheet, Stat, Tag } from './ui'

export type Tab = 'home' | 'chef' | 'recipes' | 'add' | 'saved' | 'settings' | 'profile'
export type Ctx = {
  recipes: Recipe[]; favs: string[]; isFav: (id: string) => boolean; toggleFav: (id: string) => void
  pantry: string[]; addToGrocery: (rs: Recipe[], only?: string[]) => void; openRecipe: (r: Recipe) => void
  editRecipe: (r: Recipe) => void; deleteRecipe: (id: string) => void; go: (t: Tab) => void
  // added for the backend: loading state of the recipe list, login state and the toast helper
  status: 'loading' | 'ready' | 'error'; reload: () => void; loggedIn: boolean; say: (t: string) => void
}

export const Thumb = ({ r, className = '' }: { r: Recipe; className?: string }) => (
  <div className={`relative overflow-hidden bg-ac2 ${className}`}>
    {r.img ? <img src={r.img} alt={r.name} loading="lazy" className="absolute inset-0 size-full object-cover" />
      : <span className="absolute inset-0 grid place-items-center font-display text-8xl text-ac2fg/40">{r.name[0]}</span>}
  </div>
)
export const MacroRings = ({ r, size = 72 }: { r: Recipe; size?: number }) => (
  <div className="flex gap-4 justify-between">
    <Ring value={r.p} max={50} label="Protein" color={RING_COLORS.p} size={size} />
    <Ring value={r.c} max={100} label="Carbs" color={RING_COLORS.c} size={size} />
    <Ring value={r.f} max={40} label="Fats" color={RING_COLORS.f} size={size} />
  </div>
)
const Heart = ({ r, ctx, className = '' }: { r: Recipe; ctx: Ctx; className?: string }) => (
  <button aria-label={ctx.isFav(r.id) ? `Remove ${r.name} from saved` : `Save ${r.name}`} aria-pressed={ctx.isFav(r.id)} onClick={() => ctx.toggleFav(r.id)}
    className={`relative z-10 size-12 grid place-items-center rounded-full border-2 border-[#0B1F3A] bg-white active:scale-90 transition hover:scale-110 ${ctx.isFav(r.id) ? 'text-[#D1495B]' : 'text-[#0B1F3A]'} ${className}`}><Icon n="heart" filled={ctx.isFav(r.id)} /></button>
)

export type Variant = 'feature' | 'tall' | 'row'
export function RecipeCard({ r, ctx, variant = 'tall' }: { r: Recipe; ctx: Ctx; variant?: Variant }) {
  const open = <button onClick={() => ctx.openRecipe(r)} aria-label={`Open ${r.name}`} className="absolute inset-0 z-[1] rounded-[inherit] outline-none focus-visible:ring-4 ring-ac2" />
  const lift = 'transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[8px_10px_0_var(--sh)] hover:rotate-[-.4deg]'
  if (variant === 'feature') return (
    <article className={`relative rounded-3xl border-2 border-ink overflow-hidden min-h-[380px] h-full shadow-[5px_5px_0_var(--sh)] text-white ${lift}`}>
      <Thumb r={r} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      {open}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start"><div className="flex gap-1.5 flex-wrap"><Tag>{r.zone}</Tag>{r.mine && <Tag className="!bg-ac !text-acfg">My recipe</Tag>}</div><Heart r={r} ctx={ctx} /></div>
      <div className="absolute bottom-0 inset-x-0 p-5">
        <h3 className="text-4xl md:text-5xl leading-[.95] mb-4">{r.name}</h3>
        <div className="flex gap-6"><Stat v={r.kcal} l="kcal" className="text-[#FFC857]" /><Stat v={r.time} l="min" /><Stat v={`${r.p}g`} l="protein" /></div>
      </div>
    </article>)
  if (variant === 'row') return (
    <article className={`relative bg-sf text-sfg rounded-3xl border-2 border-ink shadow-[4px_4px_0_var(--sh)] min-h-[120px] h-full flex items-center pl-5 pr-24 sm:pr-28 py-4 ${lift}`}>
      {open}
      <img src={r.img} alt="" loading="lazy" className="absolute -right-3 -top-3 size-24 sm:size-28 rounded-full object-cover border-4 border-ac shadow-[3px_3px_0_var(--sh)]" />
      <div className="min-w-0 pointer-events-none">
        <Tag className="mb-1.5">{r.zone}</Tag>
        <h3 className="text-2xl leading-none truncate">{r.name}</h3>
        <div className="flex gap-4 mt-2"><Stat v={r.kcal} l="kcal" size="text-2xl" /><Stat v={r.time} l="min" size="text-2xl" /><Stat v={`${r.p}g`} l="prot" size="text-2xl" /></div>
      </div>
      <div className="absolute right-2 bottom-1"><Heart r={r} ctx={ctx} className="!size-10" /></div>
    </article>)
  return (
    <article className={`relative bg-sf text-sfg rounded-3xl border-2 border-ink shadow-[5px_5px_0_var(--sh)] h-full min-h-[330px] flex flex-col overflow-hidden ${lift}`}>
      {open}
      <div className="relative flex-1 min-h-44" style={{ clipPath: 'polygon(0 0,100% 0,100% 90%,0 100%)' }}>
        <Thumb r={r} className="absolute inset-0" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start"><div className="flex gap-1.5 flex-wrap"><Tag>{r.zone}</Tag>{r.mine && <Tag className="!bg-ac !text-acfg">My recipe</Tag>}</div><Heart r={r} ctx={ctx} /></div>
      </div>
      <div className="p-4 pt-1 pointer-events-none">
        <h3 className="text-3xl leading-[.95] mb-3">{r.name}</h3>
        <div className="flex items-end justify-between gap-2"><Stat v={r.kcal} l="kcal" size="text-5xl" className="text-sfg" /><Stat v={r.time} l="min" /><Stat v={`${r.p}g`} l="protein" /></div>
      </div>
      {r.mine && <div className="absolute bottom-3 right-3 z-10"><RecipeMenu r={r} ctx={ctx} /></div>}
    </article>)
}

export function RecipeMenu({ r, ctx }: { r: Recipe; ctx: Ctx }) {
  const [o, setO] = useState(false); const [confirm, setConfirm] = useState(false)
  return (<>
    <button aria-label={`Options for ${r.name}`} onClick={() => setO(true)} className="size-11 grid place-items-center rounded-full border-2 border-ink bg-ac text-acfg"><Icon n="dots" /></button>
    <Sheet open={o} onClose={() => { setO(false); setConfirm(false) }} title={r.name}>
      {!confirm ? (<div className="space-y-3"><Button variant="primary" className="w-full" onClick={() => { setO(false); ctx.editRecipe(r) }}>Edit recipe</Button><Button variant="danger" className="w-full" onClick={() => setConfirm(true)}>Delete recipe</Button></div>)
        : (<div className="space-y-3"><p className="font-bold">Delete “{r.name}”? This cannot be undone.</p><div className="flex gap-2"><Button variant="secondary" className="flex-1" onClick={() => setConfirm(false)}>Cancel</Button><Button variant="danger" className="flex-1" onClick={() => { ctx.deleteRecipe(r.id); setO(false); setConfirm(false) }}>Delete</Button></div></div>)}
    </Sheet></>)
}

export function RecipeDetail({ r, ctx, onClose }: { r: Recipe | null; ctx: Ctx; onClose: () => void }) {
  if (!r) return null
  return (
    <Sheet open onClose={onClose} title={r.name}>
      <div className="relative -mx-5 -mt-2 mb-5">
        <Thumb r={r} className="h-56 md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-5 flex gap-1.5 flex-wrap"><Tag>{r.zone}</Tag>{r.mine && <Tag className="!bg-ac !text-acfg">My recipe</Tag>}<Tag>{r.meal}</Tag></div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center mb-5">
        <div className="bg-ac text-acfg border-2 border-ink rounded-2xl py-3"><Stat v={r.kcal} l="kcal" size="text-5xl" /></div>
        <div className="bg-tint border-2 border-ink rounded-2xl py-3"><Stat v={r.time} l="minutes" size="text-5xl" /></div>
        <div className="bg-tint border-2 border-ink rounded-2xl py-3"><Stat v={r.servings ?? 1} l="serving" size="text-5xl" /></div>
      </div>
      <MacroRings r={r} size={84} />
      {(r.est || r.fibre !== undefined || r.sodium !== undefined) && <p className="text-sm text-smute mt-3">{r.est && 'Nutrition estimated. '}{r.fibre !== undefined && `Fibre ${r.fibre}g. `}{r.sodium !== undefined && `Sodium ${r.sodium}mg.`}</p>}
      <IngredientChips r={r} pantry={ctx.pantry} />
      {r.steps.length > 0 && (<>
        <h3 className="text-3xl mt-8 mb-2">Method</h3>
        <ol className="space-y-2 list-decimal pl-5 font-medium">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </>)}
      <h3 className="text-3xl mt-8 mb-1">Watch how to cook it</h3>
      <p className="text-sm font-medium text-smute mb-3">Each box opens a YouTube search for this dish in a new tab.</p>
      <div className="grid min-[560px]:grid-cols-2 gap-3" aria-label="Recipe/YouTube Boxes">
        {VIDEO_VARIANTS.map((v, i) => <VideoLink key={v.label} r={r} v={v} n={i + 1} />)}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button onClick={() => ctx.addToGrocery([r])}>Add to shopping list</Button>
        <Button variant="secondary" onClick={() => ctx.toggleFav(r.id)}><span className={ctx.isFav(r.id) ? 'text-err' : ''}><Icon n="heart" filled={ctx.isFav(r.id)} /></span>{ctx.isFav(r.id) ? 'Saved' : 'Save'}</Button>
      </div>
    </Sheet>
  )
}

const VIDEO_VARIANTS = [
  { label: 'Quick version (under 20 min)', extra: 'quick under 20 minutes' },
  { label: 'Authentic traditional recipe', extra: 'authentic traditional' },
  { label: 'Healthy / low-calorie version', extra: 'healthy low calorie' },
  { label: 'Beginner-friendly tutorial', extra: 'beginner tutorial' },
]
/** https://www.youtube.com/results?search_query=DISH+NAME+RECIPE (spaces become +). Opens a YouTube search results page, not a single video. */
export const ytUrl = (q: string) => 'https://www.youtube.com/results?search_query=' + q.trim().split(/\s+/).map(encodeURIComponent).join('+')

function VideoLink({ r, v, n }: { r: Recipe; v: { label: string; extra: string }; n: number }) {
  return (
    <a data-layer={`Recipe/YouTube Box ${n}`} href={ytUrl(`${r.name} ${v.extra} recipe`)} target="_blank" rel="noopener noreferrer"
      className="group flex min-h-[88px] rounded-2xl border-2 border-ink bg-white text-[#0B1F3A] overflow-hidden shadow-[3px_3px_0_var(--sh)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_6px_0_var(--sh)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none outline-none focus-visible:ring-4 ring-ac">
      <span className="relative w-24 sm:w-28 shrink-0 bg-hd">
        {r.img && <img src={r.img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
        <span className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition" />
        <span className="absolute inset-0 grid place-items-center"><span className="size-11 rounded-xl bg-[#E11D2E] text-white grid place-items-center border-2 border-white group-hover:scale-110 transition"><Icon n="play" filled size={22} /></span></span>
      </span>
      <span className="p-3 flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <b className="font-display font-normal uppercase text-xl leading-none">{v.label}</b>
        <span className="text-sm font-medium leading-snug">Search YouTube: {r.name} recipe</span>
        <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-[.12em] text-[#44546D]">Opens YouTube <Icon n="ext" size={13} /></span>
      </span>
    </a>
  )
}

function IngredientChips({ r, pantry }: { r: Recipe; pantry: string[] }) {
  const m = matchInfo(r, pantry)
  return (
    <section aria-label="Ingredients" className="mt-6">
      <div className="flex items-end justify-between mb-2"><h3 className="text-3xl">Ingredients</h3><span className={`text-xs font-extrabold uppercase tracking-[.14em] ${m.missing.length ? 'text-err' : 'text-ok'}`}>{pantry.length ? (m.missing.length ? `Missing ${m.missing.length}` : 'You have everything') : 'Add pantry items'}</span></div>
      <div className="flex flex-wrap gap-2">
        {r.ing.map(([n, q]) => {
          const got = m.have.includes(n)
          return <span key={n} className={`inline-flex items-center gap-1.5 min-h-10 px-3 rounded-full text-base font-bold capitalize ${got ? 'bg-ok text-okfg' : 'bg-[#E3E5E8] text-[#374151]'}`}>{got && <Icon n="check" size={14} />}{n}{q && <span className="font-medium opacity-80 normal-case">· {q}</span>}</span>
        })}
      </div>
    </section>
  )
}
