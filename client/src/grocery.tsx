// The shopping-list side sheet (opened by the cart icon). It was inside App.tsx in the Figma export;
// it now lives in its own file and calls the server through the handlers App passes in.
import { useState } from 'react'
import type { GItem } from './api'
import { Button, Chip, Icon, IconButton, Sheet, inputCls } from './ui'

const AISLE: Record<string, string> = { Produce: '#9BE7A8', 'Grains & Pulses': '#FFD36B', Dairy: '#BFE0FF', Spices: '#FFA98A', Protein: '#F6A9CB', Pantry: '#E4E4E4', Other: '#E4E4E4' }

export type GroceryOps = {
  add: (name: string, qty: string) => void
  toggle: (id: string, done: boolean) => void
  remove: (id: string) => void
  clear: (onlyDone: boolean) => void
}

export function GrocerySheet({ open, onClose, grocery, ops }: { open: boolean; onClose: () => void; grocery: GItem[]; ops: GroceryOps }) {
  const [name, setName] = useState(''); const [qty, setQty] = useState('')
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; ops.add(name.trim(), qty); setName(''); setQty('') }
  const groups = Array.from(new Set(grocery.map((g) => g.cat))); const done = grocery.filter((g) => g.done).length
  return (
    <Sheet open={open} onClose={onClose} title="Shopping list" side>
      <form onSubmit={add} className="flex gap-2 mb-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add item" aria-label="Item" className={inputCls} />
        <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" aria-label="Quantity" className={inputCls + ' !w-24'} />
        <Button aria-label="Add item" className="!px-4"><Icon n="plus" /></Button>
      </form>
      {grocery.length === 0 ? <p className="text-center font-bold text-smute border-2 border-dashed border-ink rounded-2xl p-6">Your list is empty. Add missing items from a Chef AI suggestion or any recipe.</p> : (<>
        <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-5 rounded-full border-2 border-ink overflow-hidden bg-black/10"><div className="h-full bg-ac transition-all" style={{ width: (done / grocery.length) * 100 + '%' }} /></div><span className="font-display text-3xl leading-none">{done}/{grocery.length}</span></div>
        {groups.map((c) => (
          <section key={c} className="mb-5"><h3 className="inline-block text-xl px-3 py-0.5 rounded-md border-2 border-ink text-[#0B1F3A] -rotate-1 mb-1" style={{ background: AISLE[c] ?? '#E4E4E4' }}>{c}</h3>
            <ul>{grocery.filter((g) => g.cat === c).map((g) => (
              <li key={g.id} className="flex items-center gap-1 border-b-2 border-dashed border-sfg/25">
                <label className="flex-1 flex items-center gap-3 min-h-14 cursor-pointer"><input type="checkbox" checked={g.done} onChange={() => ops.toggle(g.id, !g.done)} className="size-6 accent-[#0B1F3A]" />
                  <span className={g.done ? 'line-through opacity-50' : ''}><span className="font-bold capitalize">{g.name}</span> <span className="text-smute">{g.qty}</span>{g.from.length > 0 && <span className="block text-xs font-bold text-smute">for {g.from.join(', ')}</span>}</span></label>
                <IconButton label={`Remove ${g.name}`} onClick={() => ops.remove(g.id)}><Icon n="x" size={16} /></IconButton></li>))}</ul></section>))}
        <div className="flex gap-2"><Chip onClick={() => ops.clear(true)}>Clear picked</Chip><Chip onClick={() => ops.clear(false)}>Clear all</Chip></div></>)}
    </Sheet>
  )
}
