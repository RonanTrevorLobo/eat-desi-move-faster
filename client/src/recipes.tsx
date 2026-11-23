import { useEffect, useState } from 'react'
import { DIETS, ZONES, dietOk, type Recipe } from './data'
import { RecipeCard, type Ctx, type Variant } from './shared'
import { Button, Chip, Icon, Sheet, Slider, Toggle, inputCls } from './ui'

export type Filters = { regions: string[]; diet: string; maxTime: number; kcalMin: number; kcalMax: number; sort: string; mine: boolean }
export const DEFAULT_F: Filters = { regions: [], diet: 'Any', maxTime: 240, kcalMin: 0, kcalMax: 1000, sort: 'Name', mine: false }
const SORTS = ['Name', 'Protein', 'Calories', 'Time']
// 7-card bento cycle on a 6-col grid with 190px rows: feature 3x2, row 3x1, row 3x1, tall 2x3, row 4x1, tall 2x2, tall 2x2
const CYCLE: [Variant, string][] = [
  ['feature', 'lg:col-span-3 lg:row-span-2'], ['row', 'lg:col-span-3'], ['row', 'lg:col-span-3'],
  ['tall', 'lg:col-span-2 lg:row-span-3'], ['row', 'lg:col-span-4'], ['tall', 'lg:col-span-2 lg:row-span-2'], ['tall', 'lg:col-span-2 lg:row-span-2'],
]
export function Bento({ list, ctx }: { list: Recipe[]; ctx: Ctx }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[190px] gap-x-5 gap-y-7 lg:grid-flow-dense pt-3">
      {list.map((r, i) => { const [v, span] = CYCLE[i % 7]; return <div key={r.id} className={`rise ${span} ${v === 'feature' ? 'sm:col-span-2' : ''}`}><RecipeCard r={r} ctx={ctx} variant={v} /></div> })}
    </div>
  )
}

export function Recipes({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState(''); const [f, setF] = useState<Filters>(DEFAULT_F); const [draft, setDraft] = useState<Filters>(DEFAULT_F); const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(24) // the database has 1,000+ recipes: show 24 at a time
  const list = ctx.recipes
    .filter((r) => (r.name + r.zone + r.region + r.ing.map((i) => i[0]).join()).toLowerCase().includes(q.toLowerCase()))
    .filter((r) => (!f.regions.length || f.regions.includes(r.zone)) && (f.diet === 'Any' || dietOk(r, f.diet)) && r.time <= f.maxTime && r.kcal >= f.kcalMin && r.kcal <= f.kcalMax && (!f.mine || r.mine))
    .sort((a, b) => f.sort === 'Protein' ? b.p - a.p : f.sort === 'Calories' ? a.kcal - b.kcal : f.sort === 'Time' ? a.time - b.time : a.name.localeCompare(b.name))
  useEffect(() => setShown(24), [q, f]) // new search or filter -> back to the first 24
  type A = [string, () => void]
  const active: A[] = [
    ...f.regions.map((r): A => [r, () => setF({ ...f, regions: f.regions.filter((x) => x !== r) })]),
    ...(f.diet !== 'Any' ? [[f.diet, () => setF({ ...f, diet: 'Any' })] as A] : []),
    ...(f.maxTime < 240 ? [[`≤ ${f.maxTime} min`, () => setF({ ...f, maxTime: 240 })] as A] : []),
    ...(f.kcalMin > 0 || f.kcalMax < 1000 ? [[`${f.kcalMin}-${f.kcalMax} kcal`, () => setF({ ...f, kcalMin: 0, kcalMax: 1000 })] as A] : []),
    ...(f.mine ? [['My recipes', () => setF({ ...f, mine: false })] as A] : []),
  ]
  const setRegion = (z: string | null) => setF({ ...f, mine: false, regions: z ? [z] : [] })
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><span className="font-display text-6xl outline-num leading-none text-fg">04</span>
          <h2 className="text-5xl md:text-7xl leading-[.9]">Recipe<br className="md:hidden" /> database</h2></div>
        <div className="text-right" aria-live="polite"><b className="font-display font-normal text-7xl md:text-8xl leading-none text-ac">{list.length}</b><span className="block text-xs font-extrabold uppercase tracking-[.16em]">recipe{list.length === 1 ? '' : 's'} found</span></div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1F3A]"><Icon n="search" size={18} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dish, region or ingredient" aria-label="Search recipes" className={`${inputCls} pl-11 rounded-full`} /></div>
        <Button variant="dark" onClick={() => { setDraft(f); setOpen(true) }}><Icon n="sliders" size={18} /><span className="hidden sm:inline">Filters</span>{active.length > 0 && <span className="size-6 rounded-full bg-ac text-acfg text-sm grid place-items-center">{active.length}</span>}</Button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 py-1" role="group" aria-label="Region">
        <Chip onBg selected={!f.regions.length && !f.mine} onClick={() => setRegion(null)}>All</Chip>
        {ZONES.map((z) => <Chip onBg key={z} selected={f.regions.length === 1 && f.regions[0] === z} onClick={() => setRegion(z)}>{z}</Chip>)}
        <Chip onBg selected={f.mine} onClick={() => setF({ ...f, mine: !f.mine, regions: [] })}>My recipes</Chip>
      </div>
      {active.length > 0 && <div className="flex flex-wrap gap-2 items-center">{active.map(([l, rm]) => <Chip key={l} selected onRemove={rm}>{l}</Chip>)}<Button variant="ghost" className="underline" onClick={() => setF(DEFAULT_F)}>Reset</Button></div>}
      {ctx.status === 'loading' ? (
        <p className="text-center font-display text-4xl py-16" role="status">Loading recipes…</p>
      ) : ctx.status === 'error' ? (
        <div className="border-[3px] border-dashed border-err rounded-3xl p-10 text-center space-y-3"><p className="font-display text-4xl">Could not load recipes</p><p className="text-mute font-medium">Is the server running on port 3000?</p><Button onClick={ctx.reload}>Try again</Button></div>
      ) : list.length === 0 ? (
        <div className="border-[3px] border-dashed border-fg rounded-3xl p-10 text-center space-y-3"><p className="font-display text-4xl">No recipes match</p><p className="text-mute font-medium">Try removing a filter{f.mine ? ' or add your first recipe' : ''}.</p>
          <div className="flex justify-center gap-2"><Button variant="secondary" onClick={() => setF(DEFAULT_F)}>Reset filters</Button>{f.mine && <Button onClick={() => ctx.go('add')}>Add recipe</Button>}</div></div>
      ) : <>
        <Bento list={list.slice(0, shown)} ctx={ctx} />
        {list.length > shown && <div className="text-center pt-6"><Button variant="dark" onClick={() => setShown(shown + 24)}>Show more ({list.length - shown} left)</Button></div>}
      </>}
      <button onClick={() => ctx.go('add')} aria-label="Add recipe" className="fixed z-30 right-4 bottom-28 md:bottom-8 md:right-8 size-16 rounded-full bg-ac text-acfg border-[3px] border-ink shadow-[4px_4px_0_var(--sh)] grid place-items-center hover:-translate-y-1 hover:rotate-90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"><Icon n="plus" size={30} /></button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filters" side>
        <div className="space-y-7">
          <section><h3 className="text-2xl mb-2">Region <small className="text-sm font-sans normal-case tracking-normal text-smute">multi-select</small></h3>
            <div className="flex flex-wrap gap-2">{ZONES.map((z) => <Chip key={z} selected={draft.regions.includes(z)} onClick={() => setDraft({ ...draft, regions: draft.regions.includes(z) ? draft.regions.filter((x) => x !== z) : [...draft.regions, z] })}>{z}</Chip>)}</div></section>
          <section><h3 className="text-2xl mb-2">Diet</h3><div className="flex flex-wrap gap-2">{['Any', ...DIETS].map((d) => <Chip key={d} selected={draft.diet === d} onClick={() => setDraft({ ...draft, diet: d })}>{d}</Chip>)}</div></section>
          <Slider label="Max cooking time" value={draft.maxTime} min={10} max={240} step={5} unit="MIN" onChange={(n) => setDraft({ ...draft, maxTime: n })} />
          <section><div className="flex items-end justify-between"><span className="text-xs font-extrabold uppercase tracking-[.14em]">Calorie range</span><span className="font-display text-3xl leading-none">{draft.kcalMin}-{draft.kcalMax}<small className="text-sm ml-1">KCAL</small></span></div>
            <input aria-label="Minimum calories" type="range" min={0} max={1000} step={10} value={draft.kcalMin} onChange={(e) => setDraft({ ...draft, kcalMin: Math.min(+e.target.value, draft.kcalMax) })} />
            <input aria-label="Maximum calories" type="range" min={0} max={1000} step={10} value={draft.kcalMax} onChange={(e) => setDraft({ ...draft, kcalMax: Math.max(+e.target.value, draft.kcalMin) })} /></section>
          <section><h3 className="text-2xl mb-2">Sort by</h3><div className="flex flex-wrap gap-2">{SORTS.map((s) => <Chip key={s} selected={draft.sort === s} onClick={() => setDraft({ ...draft, sort: s })}>{s}</Chip>)}</div></section>
          <Toggle label="Only my recipes" checked={draft.mine} onChange={(b) => setDraft({ ...draft, mine: b })} />
          <div className="flex gap-3 sticky bottom-0 bg-sf pt-3"><Button variant="secondary" className="flex-1" onClick={() => setDraft(DEFAULT_F)}>Reset</Button><Button className="flex-1" onClick={() => { setF(draft); setOpen(false) }}>Apply</Button></div>
        </div>
      </Sheet>
    </div>
  )
}
