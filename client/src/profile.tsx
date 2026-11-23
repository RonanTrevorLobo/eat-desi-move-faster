import { useState } from 'react'
import { DIETS } from './data'
import { THEMES, type ThemeId } from './theme'
import type { Account, BodyStats } from './api'
import type { Ctx } from './shared'
import { Button, Chip, Field, Icon, Select, Sheet, Slider, Tag, inputCls } from './ui'

const ACTIVITY: [string, string][] = [['sedentary', 'Sedentary (desk job)'], ['light', 'Light (exercise 1-3 days/week)'], ['moderate', 'Moderate (3-5 days/week)'], ['active', 'Active (6-7 days/week)'], ['very_active', 'Very active (physical job + training)']]
const GOALS: [string, string][] = [['lose', 'Lose weight'], ['maintain', 'Maintain'], ['gain', 'Gain muscle']]
const ALLERGIES = ['Peanuts', 'Tree nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish']

export function Profile({ user, ctx, savedCount, mineCount, theme, onTheme, onSave, onCalculate, onLogout, onAuth }: {
  user: Account | null; ctx: Ctx; savedCount: number; mineCount: number; theme: ThemeId; onTheme: () => void
  onSave: (p: Partial<Account>) => void; onCalculate: (b: BodyStats) => Promise<Account>; onLogout: () => void; onAuth: () => void
}) {
  const [prefs, setPrefs] = useState(false); const [out, setOut] = useState(false)
  // "Calculate my target" form (body stats are saved on the server and turned into calories + macros)
  const b0 = user?.body
  const [age, setAge] = useState(b0?.age ? String(b0.age) : ''); const [height, setHeight] = useState(b0?.heightCm ? String(b0.heightCm) : ''); const [weight, setWeight] = useState(b0?.weightKg ? String(b0.weightKg) : '')
  const [gender, setGender] = useState<'male' | 'female'>(b0?.gender ?? 'male'); const [activity, setActivity] = useState(b0?.activityLevel ?? 'light'); const [goal, setGoal] = useState(b0?.goal ?? 'maintain')
  const [calc, setCalc] = useState(user?.targets ?? null); const [calcErr, setCalcErr] = useState(''); const [calcBusy, setCalcBusy] = useState(false)
  const [diet, setDiet] = useState(user?.diet ?? 'Vegetarian'); const [al, setAl] = useState(user?.allergies ?? []); const [kcal, setKcal] = useState(user?.kcal ?? 2000)
  const initials = (user?.name ?? 'Guest').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const themeName = THEMES.find((t) => t.id === theme)!.name
  const calculate = async () => {
    setCalcErr(''); setCalcBusy(true)
    try {
      const u = await onCalculate({ age: +age, gender, heightCm: +height, weightKg: +weight, activityLevel: activity, goal }) // POST /api/profile/calculate
      setCalc(u.targets ?? null); setKcal(u.kcal)
    } catch (e) { setCalcErr(e instanceof Error ? e.message : 'Could not calculate') }
    finally { setCalcBusy(false) }
  }
  const rows: [string, string, string, () => void][] = [
    ['heart', 'Saved recipes', `${savedCount} saved`, () => ctx.go('saved')],
    ['book', 'My recipes', `${mineCount} added`, () => ctx.go('recipes')],
    ['sliders', 'Dietary preferences', user ? `${user.diet}${user.allergies.length ? ` · ${user.allergies.length} allergies` : ''} · ${user.kcal} kcal` : 'Log in to set preferences', () => (user ? setPrefs(true) : onAuth())],
    ['palette', 'Theme', themeName, onTheme],
  ]
  return (
    <div className="max-w-[560px] lg:max-w-4xl mx-auto lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 items-start" data-layer="Profile">
      <div className="text-center lg:text-left bg-sf text-sfg border-2 border-ink rounded-3xl shadow-[5px_5px_0_var(--sh)] p-6 mb-5 lg:mb-0">
        <div className="size-28 sm:size-32 mx-auto lg:mx-0 rounded-full bg-ac text-acfg border-[4px] border-ink shadow-[4px_4px_0_var(--sh)] grid place-items-center font-display text-5xl">{user ? initials : <Icon n="user" size={52} />}</div>
        <h1 className="text-4xl leading-none mt-4">{user?.name ?? 'Guest'}</h1>
        <p className="text-smute font-medium mt-1 break-all">{user?.email ?? 'Browsing as a guest'}</p>
        {user && <div className="mt-3"><Tag className="!bg-ok !text-okfg">{user.diet}</Tag></div>}
        {!user && <div className="mt-4 flex flex-col gap-2"><Button onClick={onAuth}>Log in or create account</Button></div>}
      </div>
      <div>
        <ul className="space-y-3">
          {rows.map(([ic, t, sub, fn]) => (
            <li key={t}><button onClick={fn} className="w-full min-h-[68px] flex items-center gap-4 px-4 rounded-2xl border-2 border-ink bg-sf text-sfg text-left shadow-[3px_3px_0_var(--sh)] transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <span className="size-11 rounded-xl bg-ac text-acfg border-2 border-ink grid place-items-center shrink-0"><Icon n={ic} /></span>
              <span className="flex-1 min-w-0"><b className="block font-display font-normal text-2xl leading-none">{t}</b><span className="block text-sm font-medium text-smute truncate mt-0.5">{sub}</span></span>
              <Icon n="right" /></button></li>))}
          {user && <li><button onClick={() => setOut(true)} className="w-full min-h-[68px] flex items-center gap-4 px-4 rounded-2xl border-2 border-err bg-sf text-err text-left font-display text-2xl transition-all active:scale-[.98]"><span className="size-11 rounded-xl border-2 border-err grid place-items-center shrink-0"><Icon n="logout" /></span>Log out</button></li>}
        </ul>
      </div>

      <Sheet open={prefs} onClose={() => setPrefs(false)} title="Dietary preferences">
        <div className="space-y-6">
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Diet</p><div className="flex flex-wrap gap-2">{DIETS.map((d) => <Chip key={d} selected={diet === d} onClick={() => setDiet(d)}>{d}</Chip>)}</div></div>
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] mb-2">Allergies</p><div className="flex flex-wrap gap-2">{ALLERGIES.map((a) => <Chip key={a} selected={al.includes(a)} onClick={() => setAl((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]))}>{a}</Chip>)}</div></div>
          <Slider label="Daily calorie goal" value={kcal} min={1200} max={3200} step={50} unit="KCAL" onChange={setKcal} />
          <div className="border-t-2 border-dashed border-sfg/25 pt-5 space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-[.14em]">Not sure? Calculate it from your body</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Age"><input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} className={inputCls} /></Field>
              <Field label="Height (cm)"><input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ''))} className={inputCls} /></Field>
              <Field label="Weight (kg)"><input inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/\D/g, ''))} className={inputCls} /></Field>
            </div>
            <div className="flex flex-wrap gap-2">{(['male', 'female'] as const).map((g) => <Chip key={g} selected={gender === g} onClick={() => setGender(g)}>{g === 'male' ? 'Male' : 'Female'}</Chip>)}</div>
            <Select label="Activity level" value={ACTIVITY.find(([v]) => v === activity)?.[1] ?? ''} options={ACTIVITY.map(([, l]) => l)} onChange={(l) => setActivity(ACTIVITY.find(([, x]) => x === l)?.[0] ?? 'light')} />
            <div className="flex flex-wrap gap-2">{GOALS.map(([v, l]) => <Chip key={v} selected={goal === v} onClick={() => setGoal(v)}>{l}</Chip>)}</div>
            {calcErr && <p role="alert" className="text-sm font-bold text-err">{calcErr}</p>}
            <Button variant="secondary" className="w-full" disabled={calcBusy} onClick={calculate}>{calcBusy ? 'Calculating…' : 'Calculate my target'}</Button>
            {calc && <p className="text-sm font-medium text-smute">Your target: <b className="text-sfg">{calc.calories} kcal</b> · {calc.protein} g protein · {calc.carbs} g carbs · {calc.fat} g fat. Press “Save preferences” to keep your diet and allergies too.</p>}
          </div>
          <Button className="w-full" onClick={() => { onSave({ diet, allergies: al, kcal }); setPrefs(false) }}>Save preferences</Button>
        </div>
      </Sheet>
      <Sheet open={out} onClose={() => setOut(false)} title="Log out?">
        <p className="font-medium mb-5">You'll go back to the welcome screen. Your saved recipes stay on this device.</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3"><Button variant="secondary" className="flex-1" onClick={() => setOut(false)}>Stay logged in</Button><Button variant="danger" className="flex-1" onClick={() => { setOut(false); onLogout() }}>Log out</Button></div>
      </Sheet>
    </div>
  )
}
