import { useState } from 'react'
import { ZONES, catOf, type Meal, type Recipe } from './data'
import { IngredientPicker } from './pantry'
import { Thumb, type Ctx } from './shared'
import { Button, Card, Chip, Field, Icon, Select, inputCls } from './ui'

const DIET_OPTS = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Veg', 'Jain']
type Draft = { name: string; zone: string; diet: string; meal: Meal; photo?: string; ings: string[]; time: string; servings: string; kcal: string; p: string; c: string; f: string; fibre: string; sodium: string; steps: string[] }
const EMPTY: Draft = { name: '', zone: '', diet: '', meal: 'Lunch', ings: [], time: '', servings: '2', kcal: '', p: '', c: '', f: '', fibre: '', sodium: '', steps: [''] }
const toDraft = (r: Recipe): Draft => ({
  name: r.name, zone: r.zone, meal: r.meal, diet: r.jain ? 'Jain' : r.diet === 'vegan' ? 'Vegan' : r.diet === 'egg' ? 'Eggetarian' : r.diet === 'nonveg' ? 'Non-Veg' : 'Vegetarian', photo: r.rawImg || undefined,
  ings: r.ing.map((i) => i[0]), time: String(r.time), servings: String(r.servings ?? 1), kcal: r.est ? '' : String(r.kcal), p: r.est ? '' : String(r.p), c: r.est ? '' : String(r.c), f: r.est ? '' : String(r.f),
  fibre: r.fibre !== undefined ? String(r.fibre) : '', sodium: r.sodium !== undefined ? String(r.sodium) : '', steps: r.steps.length ? r.steps : [''],
})
const num = (s: string) => (s.trim() === '' ? undefined : Number(s))
const bad = (s: string) => s.trim() !== '' && (isNaN(Number(s)) || Number(s) < 0)

export function AddRecipe({ editing, onSave, onDone, ctx }: { editing?: Recipe; onSave: (r: Recipe) => Promise<Recipe>; onDone: () => void; ctx: Ctx }) {
  const [d, setD] = useState<Draft>(editing ? toDraft(editing) : EMPTY)
  const [step, setStep] = useState(1); const [tried, setTried] = useState(false); const [saved, setSaved] = useState<Recipe | null>(null)
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const errs = {
    1: { name: !d.name.trim() && 'Give your dish a name', zone: !d.zone && 'Choose a region', diet: !d.diet && 'Pick a diet type' },
    2: { ings: !d.ings.length && 'Add at least one ingredient', time: (!d.time || +d.time <= 0) && 'Enter the total time in minutes', servings: (!d.servings || +d.servings < 1) && 'Servings must be 1 or more' },
    3: { steps: !d.steps.some((s) => s.trim()) && 'Add at least one step', nutrition: [d.kcal, d.p, d.c, d.f, d.fibre, d.sodium].some(bad) && 'Nutrition values must be numbers 0 or more' },
  } as const
  const has = (s: 1 | 2 | 3) => Object.values(errs[s]).some(Boolean)
  const next = () => { setTried(true); if (step <= 3 && has(step as 1 | 2 | 3)) return; setTried(false); setStep(step + 1); window.scrollTo({ top: 0 }) }
  const back = () => { setTried(false); setStep(step - 1) }
  const E = (s: 1 | 2 | 3, k: string) => (tried && step === s ? ((errs[s] as Record<string, string | false>)[k] || undefined) : undefined)

  const build = (): Recipe => {
    const ings = d.ings; const time = +d.time
    const est = [d.kcal, d.p, d.c, d.f].some((x) => x.trim() === '')
    const kcal = num(d.kcal) ?? Math.round(ings.length * 60 + (time > 30 ? 40 : 0))
    return {
      id: editing?.id ?? 'u-' + crypto.randomUUID(), name: d.name.trim(), region: d.zone, zone: d.zone, mine: true, est, servings: +d.servings,
      diet: d.diet === 'Vegan' ? 'vegan' : d.diet === 'Eggetarian' ? 'egg' : d.diet === 'Non-Veg' ? 'nonveg' : 'veg', jain: d.diet === 'Jain', meal: d.meal, time, tone: '#059669',
      kcal, p: num(d.p) ?? Math.round(kcal * 0.045), c: num(d.c) ?? Math.round(kcal * 0.11), f: num(d.f) ?? Math.round(kcal * 0.03), fibre: num(d.fibre), sodium: num(d.sodium),
      ing: ings.map((n) => [n, '', catOf(n)]), steps: d.steps.map((s) => s.trim()).filter(Boolean), img: d.photo,
    }
  }
  const save = async () => {
    setBusy(true); setErr('')
    try { const r = await onSave(build()); setSaved(r); setStep(5) } // the server answers with the stored recipe
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not save the recipe') }
    finally { setBusy(false) }
  }
  const photo = (file?: File) => {
    if (!file) return
    if (file.size > 1_500_000) { alert('Please choose a photo under 1.5 MB.'); return }
    const fr = new FileReader(); fr.onload = () => set({ photo: String(fr.result) }); fr.readAsDataURL(file)
  }
  const numField = (label: string, k: keyof Draft, unit: string) => (
    <Field label={`${label} (${unit})`} error={step === 3 && tried && bad(d[k] as string) ? 'Enter a number' : undefined}>
      <input inputMode="decimal" value={d[k] as string} onChange={(e) => set({ [k]: e.target.value })} placeholder="Don't know? We'll estimate" className={inputCls} />
    </Field>)

  if (step === 5 && saved) return (
    <Card className="max-w-lg mx-auto p-8 text-center space-y-4 rise">
      <div className="size-20 mx-auto rounded-full bg-ac text-acfg border-[3px] border-ink shadow-[4px_4px_0_var(--sh)] pop grid place-items-center"><Icon n="check" size={32} /></div>
      <h2 className="text-5xl">Recipe added!</h2><p className="text-lg font-bold">Chef AI can now suggest it.</p>
      <Thumb r={saved} className="h-32 rounded-2xl" />
      <div className="flex flex-col sm:flex-row gap-2 justify-center"><Button onClick={onDone}>View in Recipes</Button><Button variant="secondary" onClick={() => { setD(EMPTY); setStep(1); setSaved(null) }}>Add another</Button></div>
    </Card>)

  const review = step === 4 ? build() : null
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <div className="flex items-end justify-between mb-2"><span className="font-display text-5xl outline-num leading-none">05</span><span className="font-display text-2xl">{editing ? 'Edit recipe' : 'Add your recipe'} · {step === 4 ? 'Review' : `Step ${Math.min(step, 3)} of 3`}</span></div>
        <div className="grid grid-cols-3 gap-2" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={Math.min(step, 3)}>{[1, 2, 3].map((i) => <div key={i} className={`h-4 rounded-full border-2 border-fg ${step >= i || step === 4 ? 'bg-ac' : 'bg-transparent'} transition-all`} />)}</div>
      </div>
      <Card className="p-5 space-y-5">
        {step === 1 && (<>
          <h2 className="text-4xl leading-none">Basics</h2>
          <Field label="Dish name *" error={E(1, 'name') || undefined}><input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Mom's lemon rice" className={`${inputCls} ${E(1, 'name') ? 'border-err' : ''}`} /></Field>
          <Select label="Region *" value={d.zone} options={ZONES} onChange={(zone) => set({ zone })} placeholder="Choose a region" error={E(1, 'zone') || undefined} />
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Diet type *</p><div className="flex flex-wrap gap-2">{DIET_OPTS.map((x) => <Chip key={x} selected={d.diet === x} onClick={() => set({ diet: x })}>{x}</Chip>)}</div>
            {E(1, 'diet') && <p role="alert" className="text-sm text-err mt-1">{E(1, 'diet')}</p>}</div>
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Meal</p><div className="flex flex-wrap gap-2">{(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as Meal[]).map((x) => <Chip key={x} selected={d.meal === x} onClick={() => set({ meal: x })}>{x}</Chip>)}</div></div>
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Photo <span className="font-normal text-smute">(optional)</span></p>
            {d.photo ? <div className="relative"><img src={d.photo} alt="Dish preview" className="h-40 w-full object-cover rounded-2xl" /><Button variant="secondary" className="absolute right-2 top-2 " onClick={() => set({ photo: undefined })}>Remove</Button></div>
              : <label className="min-h-28 grid place-items-center border-2 border-dashed border-ink rounded-2xl cursor-pointer hover:bg-tint text-center p-4 bg-white text-[#0B1F3A]"><span className="text-smute text-sm"><Icon n="image" size={28} /><br />Tap to upload a photo</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => photo(e.target.files?.[0])} /></label>}</div>
        </>)}
        {step === 2 && (<>
          <h2 className="text-4xl leading-none">Ingredients and time</h2>
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Ingredients *</p>
            <IngredientPicker items={d.ings} setItems={(fn) => setD((x) => ({ ...x, ings: fn(x.ings) }))} emptyText="No ingredients yet. Search above or tap a common item." />
            {E(2, 'ings') && <p role="alert" className="text-sm text-err mt-1">{E(2, 'ings')}</p>}</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total time (min) *" error={E(2, 'time') || undefined}><input inputMode="numeric" value={d.time} onChange={(e) => set({ time: e.target.value.replace(/\D/g, '') })} className={`${inputCls} ${E(2, 'time') ? 'border-err' : ''}`} placeholder="30" /></Field>
            <Field label="Servings *" error={E(2, 'servings') || undefined}><input inputMode="numeric" value={d.servings} onChange={(e) => set({ servings: e.target.value.replace(/\D/g, '') })} className={inputCls} /></Field>
          </div>
        </>)}
        {step === 3 && (<>
          <h2 className="text-4xl leading-none">Nutrition and steps</h2>
          <p className="text-sm text-smute -mt-3">Per serving. Leave blank and we'll estimate.</p>
          <div className="grid grid-cols-2 gap-3">{numField('Calories', 'kcal', 'kcal')}{numField('Protein', 'p', 'g')}{numField('Carbs', 'c', 'g')}{numField('Fats', 'f', 'g')}{numField('Fibre', 'fibre', 'g')}{numField('Sodium', 'sodium', 'mg')}</div>
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Method *</p>
            <ol className="space-y-3">{d.steps.map((s, i) => (
              <li key={i} className="flex gap-2 items-start"><b className="size-9 mt-1.5 shrink-0 grid place-items-center rounded-full bg-ac text-acfg border-2 border-ink font-display text-lg">{i + 1}</b>
                <textarea value={s} rows={2} onChange={(e) => set({ steps: d.steps.map((x, j) => (j === i ? e.target.value : x)) })} placeholder="Describe this step" aria-label={`Step ${i + 1}`} className={inputCls} />
                {d.steps.length > 1 && <button aria-label={`Remove step ${i + 1}`} onClick={() => set({ steps: d.steps.filter((_, j) => j !== i) })} className="size-11 shrink-0 grid place-items-center text-smute hover:text-err"><Icon n="x" /></button>}</li>))}</ol>
            <Button variant="secondary" className="mt-3" onClick={() => set({ steps: [...d.steps, ''] })}><Icon n="plus" size={16} />Add step</Button>
            {E(3, 'steps') && <p role="alert" className="text-sm text-err mt-1">{E(3, 'steps')}</p>}
            {E(3, 'nutrition') && <p role="alert" className="text-sm text-err mt-1">{E(3, 'nutrition')}</p>}</div>
        </>)}
        {review && (<>
          <h2 className="text-4xl leading-none">Review</h2>
          <Thumb r={review} className="h-36 rounded-2xl" />
          <div><h3 className="text-4xl leading-none">{review.name}</h3><p className="text-sm text-smute">{review.zone} · {d.diet} · {review.time} min · {review.servings} servings</p></div>
          <div className="grid grid-cols-4 gap-2 text-center">{[['kcal', review.kcal], ['Protein', review.p], ['Carbs', review.c], ['Fats', review.f]].map(([l, v]) => <div key={l} className="bg-tint border-2 border-ink rounded-xl py-2"><b className="block font-display font-normal text-3xl">{v}</b><span className="text-xs text-smute">{l}</span></div>)}</div>
          {review.est && <p className="text-xs text-smute">Some nutrition values are estimated.</p>}
          <div><b className="text-xs font-extrabold uppercase tracking-[.14em]">Ingredients</b><div className="flex flex-wrap gap-1.5 mt-1">{review.ing.map(([n]) => <span key={n} className="px-2.5 py-1 rounded-full text-xs bg-tint font-bold capitalize">{n}</span>)}</div></div>
          <ol className="list-decimal pl-5 text-sm space-y-1">{review.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </>)}
      </Card>
      {err && <p role="alert" className="rounded-xl border-2 border-[#A82A3D] bg-[#FFE0E3] text-[#7A1626] font-bold px-3.5 py-3">{err}</p>}
      <div className="flex gap-3 sticky bottom-[88px] md:static">
        {step > 1 && <Button variant="secondary" className="flex-1 " onClick={back}>Back</Button>}
        {step < 4 ? <Button className="flex-1" onClick={next}>{step === 3 ? 'Review' : 'Next'}</Button> : <Button className="flex-1" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save to my recipes'}</Button>}
      </div>
      {step === 1 && ctx && null}
    </div>
  )
}
