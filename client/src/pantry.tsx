import { useState } from 'react'
import { ALL_ING, CATALOG } from './data'
import { Button, Chip, Icon, inputCls } from './ui'

const STICKER: Record<string, string> = { Vegetables: '#9BE7A8', 'Dals and Grains': '#FFD36B', Dairy: '#BFE0FF', Spices: '#FFA98A', Proteins: '#F6A9CB', Other: '#E4E4E4' }
const catKey = (n: string) => Object.keys(CATALOG).find((c) => CATALOG[c].includes(n)) ?? 'Other'
const tilt = (n: string) => ((n.length * 7) % 5) - 2

export function Sticker({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <span className="pop inline-flex items-center gap-1 min-h-11 pl-3.5 pr-1.5 rounded-xl border-2 border-[#0B1F3A] text-[#0B1F3A] font-extrabold capitalize shadow-[2px_2px_0_#0B1F3A]" style={{ background: STICKER[catKey(name)], transform: `rotate(${tilt(name)}deg)` }}>
      {name}{onRemove && <button aria-label={`Remove ${name}`} onClick={onRemove} className="size-9 grid place-items-center rounded-full hover:bg-black/15"><Icon n="x" size={14} /></button>}
    </span>
  )
}

export function IngredientPicker({ items, setItems, emptyText = 'Your pantry is empty. Add items to get started.' }: { items: string[]; setItems: (f: (x: string[]) => string[]) => void; emptyText?: string }) {
  const [q, setQ] = useState(''); const [focus, setFocus] = useState(false); const [tab, setTab] = useState(Object.keys(CATALOG)[0])
  const add = (raw: string) => { const v = raw.trim().toLowerCase(); if (!v) return; setItems((x) => (x.includes(v) ? x : [...x, v])); setQ('') }
  const ql = q.trim().toLowerCase()
  const sugg = ql ? ALL_ING.filter((i) => i.includes(ql) && !items.includes(i)).sort((a, b) => +b.startsWith(ql) - +a.startsWith(ql)).slice(0, 6) : []
  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1F3A]"><Icon n="search" size={18} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 120)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(sugg[0] ?? q) } }} placeholder="Add an ingredient…" aria-label="Add an ingredient" className={`${inputCls} pl-11 rounded-full`} />
        {focus && ql && (
          <ul className="absolute z-20 mt-2 w-full bg-white text-[#0B1F3A] border-2 border-ink rounded-2xl shadow-[4px_4px_0_var(--sh)] overflow-hidden">
            {sugg.map((s) => <li key={s}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(s)} className="w-full min-h-11 px-4 text-left font-bold hover:bg-[#FFE2A8] capitalize">{s}</button></li>)}
            {!sugg.includes(ql) && <li><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(q)} className="w-full min-h-11 px-4 text-left font-extrabold hover:bg-[#FFE2A8]">Add “{q.trim()}”</button></li>}
          </ul>)}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-display text-3xl leading-none">{items.length} <small className="text-sm tracking-widest">{items.length === 1 ? 'ITEM' : 'ITEMS'}</small></span>
        <Button variant="ghost" className="!px-3 underline" disabled={!items.length} onClick={() => setItems(() => [])}>Clear all</Button>
      </div>
      {items.length === 0
        ? <p className="font-bold text-smute border-2 border-dashed border-ink rounded-2xl px-4 py-6 text-center">{emptyText}</p>
        : <div className="flex flex-wrap gap-2.5">{items.map((i) => <Sticker key={i} name={i} onRemove={() => setItems((x) => x.filter((y) => y !== i))} />)}</div>}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.16em] mb-2">Common items</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1" role="tablist">{Object.keys(CATALOG).map((c) => <Chip key={c} selected={tab === c} onClick={() => setTab(c)}>{c}</Chip>)}</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {CATALOG[tab].filter((i) => !items.includes(i)).map((i) => (
            <button key={i} onClick={() => add(i)} className="min-h-11 px-4 rounded-xl border-2 border-dashed border-ink text-[#0B1F3A] font-bold capitalize whitespace-nowrap active:scale-90 transition hover:-translate-y-0.5" style={{ background: STICKER[tab] }}>+ {i}</button>))}
          {CATALOG[tab].every((i) => items.includes(i)) && <span className="text-smute font-bold py-2">All added</span>}
        </div>
      </div>
    </div>
  )
}
