// Meal plans: the card shown inside Chef AI chat (PlanView) and the "Saved meal plans" list (SavedPlans).
// The plan itself is built on the SERVER (server/src/utils/mealPlanner.js); this file only draws it.
import { useEffect, useState } from 'react'
import { api, type ApiPlan } from './api'
import type { Ctx } from './shared'
import { Button, Chip, Sheet, Stat } from './ui'

/** All distinct recipes used in a plan, found in the loaded recipe list (used for the shopping list). */
const recipesOf = (plan: ApiPlan, ctx: Ctx) => {
  const ids = Array.from(new Set(plan.days.flatMap((d) => d.meals.flatMap((m) => m.items.map((i) => i.recipeId)))))
  return ids.map((id) => ctx.recipes.find((r) => r.id === id)).filter(Boolean) as Ctx['recipes']
}

export function PlanView({ plan, ctx, saved }: { plan: ApiPlan; ctx: Ctx; saved?: boolean }) {
  const [day, setDay] = useState(0); const [busy, setBusy] = useState(false); const [isSaved, setIsSaved] = useState(!!saved)
  const d = plan.days[day]
  if (!d) return null
  const save = async () => {
    if (!ctx.loggedIn) return ctx.say('Log in to save plans')
    setBusy(true)
    try { await api.savePlan({ ...plan, name: `${plan.days.length > 1 ? 'Weekly' : 'Daily'} ${plan.dietType.toLowerCase()} plan` }); setIsSaved(true); ctx.say('Plan saved') }
    catch (e) { ctx.say(e instanceof Error ? e.message : 'Could not save the plan') }
    finally { setBusy(false) }
  }
  return (
    <div className="rise bg-sf text-sfg border-[3px] border-ink rounded-3xl shadow-[6px_6px_0_var(--sh)] overflow-hidden max-w-md">
      {plan.days.length > 1 && <div className="flex overflow-x-auto no-scrollbar gap-2 p-3 bg-hd">{plan.days.map((p, i) => <Chip key={p.day} selected={day === i} onBg onClick={() => setDay(i)} className="text-hdfg">Day {i + 1}</Chip>)}</div>}
      <ul>{d.meals.map((m) => (
        <li key={m.slot} className="px-4 py-3 flex justify-between gap-3 items-start border-b-2 border-dashed border-sfg/25">
          <div className="min-w-0"><span className="text-xs font-extrabold uppercase tracking-[.16em] text-smute">{m.slot}</span>
            {m.items.map((it) => {
              const r = ctx.recipes.find((x) => x.id === it.recipeId)
              return (
                <div key={it.recipeId}>
                  <button onClick={() => r && ctx.openRecipe(r)} className="block font-bold text-lg text-left min-h-7 hover:underline">{it.name}</button>
                  <span className="text-sm text-smute">{it.servings === 1 ? '1 serving' : `${it.servings} servings`} · P{Math.round(it.protein)} C{Math.round(it.carbs)} F{Math.round(it.fat)}</span>
                </div>)
            })}</div>
          <Stat v={Math.round(m.items.reduce((s, i) => s + i.calories, 0))} l="kcal" size="text-3xl" className="text-right shrink-0" /></li>))}</ul>
      <div className="px-4 py-3 bg-ac text-acfg flex flex-wrap items-center justify-between gap-2">
        <Stat v={d.totals.calories} l={`kcal today · goal ${plan.targetCalories}`} size="text-4xl" />
        <div className="flex gap-2 flex-wrap">
          <Button variant="dark" onClick={() => ctx.addToGrocery(recipesOf(plan, ctx))}>Add plan to list</Button>
          {!saved && <Button variant="secondary" disabled={busy || isSaved} onClick={save}>{isSaved ? 'Saved' : 'Save plan'}</Button>}
        </div>
      </div>
    </div>
  )
}

/** "Saved meal plans" section of the Saved tab. */
export function SavedPlans({ ctx, active }: { ctx: Ctx; active: boolean }) {
  const [plans, setPlans] = useState<ApiPlan[]>([]); const [open, setOpen] = useState<ApiPlan | null>(null); const [error, setError] = useState('')
  // Reload each time the Saved tab is shown (the plan may have just been saved from the chat)
  useEffect(() => {
    if (!active || !ctx.loggedIn) return
    api.getPlans().then(setPlans).catch((e) => setError(e.message))
  }, [active, ctx.loggedIn])
  const show = async (id: string) => { try { setOpen(await api.getPlan(id)) } catch (e) { ctx.say(e instanceof Error ? e.message : 'Could not open the plan') } }
  const remove = async (id: string) => { await api.deletePlan(id).catch(() => {}); setPlans((p) => p.filter((x) => x._id !== id)); ctx.say('Plan deleted') }

  return (
    <section className="mt-14">
      <h2 className="text-4xl md:text-5xl leading-[.9] mb-5">Saved meal plans</h2>
      {error && <p role="alert" className="font-bold text-err">{error}</p>}
      {!ctx.loggedIn || plans.length === 0 ? (
        <p className="border-[3px] border-dashed border-fg rounded-3xl p-8 text-center font-medium text-mute">Ask Chef AI for a daily or weekly plan, then tap “Save plan”.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{plans.map((p) => (
          <article key={p._id} className="bg-sf text-sfg border-2 border-ink rounded-3xl shadow-[5px_5px_0_var(--sh)] p-5 space-y-3">
            <h3 className="text-3xl leading-none">{p.name}</h3>
            <p className="text-sm text-smute font-medium">{p.days.length} day{p.days.length > 1 ? 's' : ''} · {p.targetCalories} kcal · {p.dietType}{p.createdAt && ` · ${new Date(p.createdAt).toLocaleDateString()}`}</p>
            <div className="flex gap-2"><Button onClick={() => show(p._id!)}>Open</Button><Button variant="danger" onClick={() => remove(p._id!)}>Delete</Button></div>
          </article>))}</div>
      )}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''}>{open && <PlanView plan={open} ctx={ctx} saved />}</Sheet>
    </section>
  )
}
