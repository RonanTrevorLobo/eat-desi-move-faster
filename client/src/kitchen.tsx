import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_ING, DIETS, matchInfo, toUi, type Recipe } from './data'
import { api, type ApiPlan } from './api'
import { IngredientPicker } from './pantry'
import { PlanView } from './plans'
import { MacroRings, Thumb, type Ctx } from './shared'
import { Button, Card, Chip, Icon, Mascot, Slider, Stat, Tag, inputCls } from './ui'

type Msg = { id: number; who: 'bot' | 'me'; kind: 'text' | 'recipes' | 'plan' | 'error'; text: string; recipes?: Recipe[]; pantry?: string[]; plan?: ApiPlan; retry?: string }
const SAMPLE = ['paneer', 'spinach', 'rice', 'curd', 'onion', 'tomato', 'atta']

function TradingCard({ r, pantry, ctx }: { r: Recipe; pantry: string[]; ctx: Ctx }) {
  const m = matchInfo(r, pantry)
  return (
    <div className="rise bg-sf text-sfg border-[3px] border-ink rounded-3xl shadow-[6px_6px_0_var(--sh)] overflow-hidden max-w-md">
      <div className="relative">
        <Thumb r={r} className="h-48" />
        <span className="absolute top-3 left-3 flex gap-1.5"><Tag>{r.zone}</Tag></span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-hd text-hdfg rounded-full px-3 py-1.5 font-display text-xl border-2 border-white"><Icon n="clock" size={16} />{r.time} MIN</span>
        <button aria-label={ctx.isFav(r.id) ? 'Remove from saved' : 'Save recipe'} onClick={() => ctx.toggleFav(r.id)} className={`absolute -bottom-5 right-4 size-12 grid place-items-center rounded-full border-2 border-ink bg-white z-10 active:scale-90 ${ctx.isFav(r.id) ? 'text-[#D1495B]' : 'text-[#0B1F3A]'}`}><Icon n="heart" filled={ctx.isFav(r.id)} /></button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h4 className="font-display text-3xl leading-[.95]">{r.name}</h4>
          <div className="bg-ac text-acfg border-2 border-ink rounded-xl px-3 py-1.5 -rotate-3 shrink-0"><Stat v={r.kcal} l="kcal" size="text-4xl" /></div>
        </div>
        <MacroRings r={r} size={64} />
        <div>
          <div className="flex flex-wrap gap-1.5">
            {m.have.map((n) => <span key={n} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-ok text-okfg capitalize"><Icon n="check" size={13} />{n}</span>)}
            {m.missing.map((n) => <span key={n} className="px-2.5 py-1 rounded-full text-sm font-semibold bg-[#E3E5E8] text-[#374151] capitalize">{n}</span>)}
          </div>
          <p className={`text-xs font-extrabold uppercase tracking-[.14em] mt-2 ${m.missing.length ? 'text-err' : 'text-ok'}`}>{m.missing.length ? `Missing ${m.missing.length} item${m.missing.length > 1 ? 's' : ''}` : 'You have everything'}</p>
        </div>
        <div className="flex flex-col gap-2">
          {m.missing.length > 0 && <Button onClick={() => ctx.addToGrocery([r], m.missing)}><Icon n="cart" size={18} />Add missing items to shopping list</Button>}
          <Button variant="secondary" onClick={() => ctx.openRecipe(r)}>View full recipe</Button>
        </div>
      </div>
    </div>
  )
}

export function Kitchen({ ctx, pantry, setPantry, initDiet = 'Vegetarian', initKcal = 2000 }: { ctx: Ctx; pantry: string[]; setPantry: (f: (x: string[]) => string[]) => void; initDiet?: string; initKcal?: number }) {
  const [open, setOpen] = useState(true)
  const [diet, setDiet] = useState(initDiet); const [maxTime, setMaxTime] = useState(45); const [kcal, setKcal] = useState(initKcal)
  const [msgs, setMsgs] = useState<Msg[]>([]); const [input, setInput] = useState(''); const [typing, setTyping] = useState(false)
  const end = useRef<HTMLDivElement>(null); const idRef = useRef(1)
  // recipe cards are rebuilt from the recipe list the app already loaded
  const byId = useMemo(() => new Map(ctx.recipes.map((r) => [r.id, r])), [ctx.recipes])
  useEffect(() => { if (msgs.length) end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [msgs, typing])

  // Load the saved chat from the database once the recipes are ready (GET /api/chat)
  useEffect(() => {
    if (ctx.status !== 'ready') return
    api.getChat().then((rows) => setMsgs(rows.map((m): Msg => ({
      id: idRef.current++, who: m.role === 'user' ? 'me' : 'bot', kind: m.kind, text: m.content,
      recipes: m.recipeIds.map((id) => byId.get(id)).filter(Boolean) as Recipe[], pantry, plan: m.plan ?? undefined,
    })))).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.status])

  const send = async (t: string, pan0 = pantry) => {
    if (!t.trim() || typing) return
    const s = t.toLowerCase()
    setMsgs((m) => [...m, { id: idRef.current++, who: 'me', kind: 'text', text: t }]); setInput(''); setTyping(true)
    try {
      if (!navigator.onLine || s.trim() === '/error') throw new Error('offline') // "/error" lets you demo the error + retry bubble
      // pantry items + any known ingredient the user typed in the message
      const pan = Array.from(new Set([...pan0, ...ALL_ING.filter((i) => new RegExp(`\\b${i}\\b`).test(s))]))
      const res = await api.sendChat({ message: t, pantry: pan, diet, maxTime, kcal }) // POST /api/chat
      setMsgs((x) => [...x, {
        id: idRef.current++, who: 'bot', kind: res.kind, text: res.reply, pantry: pan, plan: res.plan,
        recipes: res.recipes?.map((r) => byId.get(r._id) ?? toUi(r)),
      }])
    } catch (e) {
      const text = e instanceof Error && e.message !== 'offline' ? e.message : 'Something went wrong reaching Chef AI. Check your connection and try again.'
      setMsgs((x) => [...x, { id: idRef.current++, who: 'bot', kind: 'error', text, retry: t }])
    } finally { setTyping(false) }
  }
  const clearChat = async () => { await api.clearChat().catch(() => {}); setMsgs([]) } // DELETE /api/chat
  const usePantry = () => { let p = pantry; if (!p.length) { p = SAMPLE; setPantry(() => SAMPLE) } send(`I have ${p.join(', ')}. What can I cook?`, p) }
  const bubble = 'border-[3px] border-ink rounded-2xl px-4 py-3 font-medium text-base shadow-[3px_3px_0_var(--sh)]'

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
      <div className="space-y-5 lg:sticky lg:top-24">
        <Card>
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full min-h-16 px-5 flex items-center justify-between text-left">
            <span className="flex items-center gap-3"><span className="font-display text-5xl outline-num leading-none">01</span><span className="font-display text-3xl">My Pantry</span><Tag className="!bg-ac !text-acfg">{pantry.length}</Tag></span>
            <span className={`transition ${open ? 'rotate-180' : ''}`}><Icon n="chevron" /></span>
          </button>
          {open && <div className="px-5 pb-5"><IngredientPicker items={pantry} setItems={setPantry} /></div>}
        </Card>
        <Card className="p-5 space-y-5">
          <div className="flex items-center gap-3"><span className="font-display text-5xl outline-num leading-none">02</span><span className="font-display text-3xl">Your Goals</span></div>
          <div><p className="text-xs font-extrabold uppercase tracking-[.16em] mb-2">Diet type</p><div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{DIETS.map((d) => <Chip key={d} selected={diet === d} onClick={() => setDiet(d)}>{d}</Chip>)}</div></div>
          <Slider label="Max time per dish" value={maxTime} min={10} max={240} step={5} unit="MIN" onChange={setMaxTime} />
          <Slider label="Daily calories" value={kcal} min={1200} max={3200} step={50} unit="KCAL" onChange={setKcal} />
        </Card>
      </div>

      <Card className="flex flex-col overflow-hidden !shadow-[8px_8px_0_var(--sh)]">
        <div className="px-5 py-4 bg-hd text-hdfg border-b-4 border-ac flex items-center gap-3">
          <Mascot size={52} />
          <div><h2 className="text-4xl leading-none">Chef AI</h2><p className="text-sm text-hdfg/80 font-medium mt-1">Your Indian kitchen coach</p></div>
          {msgs.length > 0 && <Chip onBg onClick={clearChat} className="ml-auto text-hdfg">Clear chat</Chip>}
        </div>
        <div className="p-4 sm:p-5 space-y-5 lg:h-[620px] lg:overflow-y-auto min-h-80" aria-live="polite">
          <div className="flex gap-2 items-end"><span className="shrink-0 hidden sm:block"><Mascot size={36} /></span>
            <div className={`${bubble} bg-tint max-w-[92%] rounded-bl-sm`}>Tell me what's in your kitchen and I'll suggest meals from our recipe database.</div></div>
          {msgs.length === 0 && (
            <div className="border-[3px] border-dashed border-ink rounded-3xl p-6 text-center space-y-3">
              <p className="font-display text-3xl">Nothing cooking yet</p>
              <p className="text-smute font-medium">{pantry.length ? `${pantry.length} pantry items ready.` : 'Add pantry items or start with a quick prompt.'}</p>
              <div className="flex flex-wrap justify-center gap-2">{['Weekly meal plan', 'High protein dinner', 'Quick South Indian breakfast', 'Daily meal plan'].map((c) => <Chip key={c} onClick={() => send(c)}>{c}</Chip>)}</div>
            </div>)}
          {msgs.map((m) => m.who === 'me' ? (
            <div key={m.id} className="flex justify-end rise"><div className={`${bubble} bg-ac text-acfg max-w-[88%] rounded-br-sm font-bold`}>{m.text}</div></div>
          ) : (
            <div key={m.id} className="space-y-3 rise">
              <div className="flex gap-2 items-end"><span className="shrink-0 hidden sm:block"><Mascot size={36} /></span>
                <div className={`${bubble} max-w-[92%] rounded-bl-sm ${m.kind === 'error' ? 'bg-[#FFE0E3] text-[#7A1626] !border-[#A82A3D]' : 'bg-tint'}`}>{m.text}
                  {m.kind === 'error' && <div className="mt-3"><Button variant="danger" onClick={() => send(m.retry!)}>Try again</Button></div>}</div></div>
              {m.recipes && <div className="space-y-5 sm:pl-11">{m.recipes.map((r) => <TradingCard key={r.id} r={r} pantry={m.pantry ?? []} ctx={ctx} />)}</div>}
              {m.plan && <div className="sm:pl-11"><PlanView plan={m.plan} ctx={ctx} /></div>}
              {m.kind !== 'error' && <p className="text-xs font-bold uppercase tracking-[.12em] text-smute sm:pl-11">Based on 1,000+ recipes in our database</p>}
            </div>))}
          {typing && (
            <div className="flex gap-2 items-end" role="status" aria-label="Chef AI is typing"><Mascot size={36} />
              <div className={`${bubble} bg-tint flex gap-2 py-4`}>{['#D1495B', '#FF8A1F', '#1B8A5A'].map((c, i) => <span key={i} className="size-3.5 rounded-full border-2 border-ink" style={{ background: c, animation: `hop 1s ${i * 0.15}s infinite` }} />)}</div></div>)}
          <div ref={end} />
        </div>
        <div className="sticky bottom-[84px] md:static bg-sf border-t-4 border-ink p-3 space-y-2.5">
          <Chip onClick={usePantry} className="!bg-ac2 !text-ac2fg"><Icon n="plus" size={16} />Use my pantry</Chip>
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message Chef AI" placeholder="Ask for a recipe or meal plan…" className={inputCls + ' rounded-full'} />
            <button aria-label="Send" disabled={!input.trim() || typing} className="size-12 shrink-0 rounded-full bg-ac text-acfg border-2 border-ink shadow-[3px_3px_0_var(--sh)] grid place-items-center active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-45 disabled:grayscale transition"><Icon n="send" /></button>
          </form>
        </div>
      </Card>
    </div>
  )
}
