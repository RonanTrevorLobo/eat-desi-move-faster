import { useState, type ReactNode } from 'react'
import { DIETS, PHOTO } from './data'
import { THEMES, type Mode, type ThemeId } from './theme'
import { api, type Account } from './api'
import { Button, Chip, Icon, Mascot, Slider, Card } from './ui'

export type { Account }
const ALLERGIES = ['Peanuts', 'Tree nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish']
const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim())
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const Spinner = () => <svg viewBox="0 0 24 24" width="20" height="20" className="animate-spin" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="4" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
const ErrorBox = ({ children }: { children: ReactNode }) => <div role="alert" className="flex gap-2 items-start rounded-xl border-2 border-[#A82A3D] bg-[#FFE0E3] text-[#7A1626] px-3.5 py-3 font-bold text-base">{children}</div>
const Label = ({ children }: { children: ReactNode }) => <span className="text-xs font-extrabold uppercase tracking-[.14em]">{children}</span>

export function AuthInput({ label, value, onChange, type = 'text', error, disabled, autoComplete, placeholder, id, inputMode }: { label: string; value: string; onChange: (v: string) => void; type?: string; error?: boolean; disabled?: boolean; autoComplete?: string; placeholder?: string; id: string; inputMode?: 'email' | 'text' }) {
  const [show, setShow] = useState(false); const pw = type === 'password'
  return (
    <div data-layer={`${label} Input`}>
      <label htmlFor={id}><Label>{label}</Label></label>
      <div className="relative mt-1.5">
        <input id={id} type={pw && show ? 'text' : type} value={value} disabled={disabled} autoComplete={autoComplete} placeholder={placeholder} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} aria-invalid={error}
          className={`w-full min-h-[52px] rounded-xl border-2 px-4 text-base font-medium bg-white text-[#0B1F3A] outline-none transition placeholder:text-[#5B6B80] focus:ring-4 ring-ac focus:border-ac disabled:opacity-50 disabled:bg-[#E3E5E8] ${pw ? 'pr-14' : ''} ${error ? 'border-[#D1495B] ring-2 ring-[#D1495B]/40' : value ? 'border-ac2' : 'border-ink'}`} />
        {pw && <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-0.5 top-1/2 -translate-y-1/2 size-12 grid place-items-center text-[#0B1F3A] rounded-full"><Icon n={show ? 'eyeoff' : 'eye'} /></button>}
      </div>
    </div>
  )
}

const Brand = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-display text-2xl leading-none text-white ${className}`}><Mascot size={40} />AI Indian Meal Prep <span className="text-ac">Planner</span></div>
)

function Shell({ photo, alt, quote, children }: { photo: string; alt: string; quote: string; children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-bg text-fg">
      <div className="relative h-44 sm:h-60 lg:min-h-screen lg:sticky lg:top-0 overflow-hidden bg-hd lg:self-start lg:h-screen" data-layer="Auth/Photo Panel">
        <img src={photo} alt={alt} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/55 to-[#0B1F3A]/25 lg:bg-gradient-to-t lg:from-[#0B1F3A]/95 lg:via-[#0B1F3A]/30" />
        <Brand className="absolute top-4 left-5 sm:left-8 lg:top-8 lg:left-10" />
        <p className="hidden lg:block absolute bottom-12 left-10 right-10 font-display text-7xl leading-[.9] text-white">{quote}</p>
      </div>
      <div className="px-5 sm:px-6 pt-7 pb-[max(2rem,env(safe-area-inset-bottom))] lg:py-12 flex lg:items-center justify-center">
        <div className="w-full max-w-[560px] lg:max-w-[440px]">{children}</div>
      </div>
    </div>
  )
}
const Heading = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="mb-6"><h1 className="text-5xl sm:text-6xl leading-[.9]">{children}</h1>{sub && <p className="mt-3 text-lg font-medium text-mute">{sub}</p>}</div>
)
const LinkBtn = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => <button type="button" onClick={onClick} className="min-h-12 px-1 font-extrabold underline underline-offset-4 decoration-2 decoration-ac hover:text-ac">{children}</button>

const GoogleMark = () => <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.400-.2-2H12v3.800h5.600a4.800 4.800 0 0 1-2.100 3.100v2.600h3.400c2-1.800 3.100-4.500 3.100-7.500z" /><path fill="#34A853" d="M12 22c2.800 0 5.200-.9 6.900-2.500l-3.400-2.600c-.9.600-2.100 1-3.500 1-2.700 0-5-1.800-5.800-4.300H2.700v2.700A10 10 0 0 0 12 22z" /><path fill="#FBBC05" d="M6.200 13.600a6 6 0 0 1 0-3.800V7.100H2.700a10 10 0 0 0 0 9.200z" /><path fill="#EA4335" d="M12 6c1.500 0 2.900.5 4 1.600l3-3A10 10 0 0 0 2.700 7.100l3.500 2.700C7 7.800 9.300 6 12 6z" /></svg>
const AppleMark = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M16.4 12.6c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.8-3.500.8s-1.800-.8-3-.8c-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7 2-1.100 2.800-2.200c.9-1.300 1.200-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.800zM14.200 5.700c.6-.8 1.100-1.800.9-2.900-1 0-2.100.6-2.800 1.400-.6.700-1.100 1.800-1 2.800 1.100.1 2.200-.5 2.900-1.300z" /></svg>
const Social = ({ icon, label, onClick, disabled }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} data-layer={`Social/${label}`} className="flex-1 min-h-[52px] inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-white text-[#0B1F3A] font-extrabold shadow-[3px_3px_0_var(--sh)] transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-45 disabled:pointer-events-none outline-none focus-visible:ring-4 ring-ac">{icon}{label}</button>
)

type Screen = 'welcome' | 'login' | 'signup' | 'forgot'
export function Auth({ onLogin, onGuest, theme, setTheme, mode }: {
  onLogin: (a: Account) => void; onGuest: () => void; theme: ThemeId; setTheme: (t: ThemeId) => void; mode: Mode
}) {
  const [screen, setScreen] = useState<Screen>('welcome')
  if (screen === 'welcome') return <Welcome go={setScreen} onGuest={onGuest} />
  if (screen === 'login') return <Login go={setScreen} onLogin={onLogin} />
  if (screen === 'signup') return <Signup go={setScreen} onLogin={onLogin} theme={theme} setTheme={setTheme} mode={mode} />
  return <Forgot go={setScreen} />
}

function Welcome({ go, onGuest }: { go: (s: Screen) => void; onGuest: () => void }) {
  return (
    <div className="relative min-h-screen text-white flex flex-col overflow-hidden bg-[#0B1F3A]" data-layer="Welcome">
      <img src={PHOTO.thali} alt="Colourful Indian thali bowls" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/80 to-[#0B1F3A]/35 lg:bg-gradient-to-r lg:from-[#0B1F3A] lg:via-[#0B1F3A]/75 lg:to-transparent" />
      <header className="relative px-5 sm:px-8 lg:px-14 pt-[max(1.25rem,env(safe-area-inset-top))]"><Brand /></header>
      <main className="relative flex-1 flex items-end lg:items-center px-5 sm:px-8 lg:px-14 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10">
        <div className="w-full max-w-[560px] mx-auto lg:mx-0 lg:max-w-xl">
          <p className="inline-block bg-ac text-acfg font-extrabold text-xs uppercase tracking-[.2em] px-3 py-1.5 -rotate-1 border-2 border-ink">Indian meal prep for active people</p>
          <h1 className="mt-4 text-[clamp(3.25rem,13vw,6.5rem)] leading-[.88]">Eat smart.<br />Cook <span className="text-ac">Indian.</span><br />Feel strong.</h1>
          <p className="mt-4 text-lg font-medium text-white/95 max-w-md">Tell Chef AI what is in your kitchen and get macro-counted Indian meals, plans and a shopping list in seconds.</p>
          <div className="mt-7 flex flex-col gap-3">
            <Button onClick={() => go('login')} className="w-full !min-h-14 !text-lg" data-layer="Welcome/Log in">Log in</Button>
            <Button onClick={() => go('signup')} className="w-full !min-h-14 !text-lg !bg-transparent !text-white !border-white !shadow-none hover:!bg-white/15" data-layer="Welcome/Create account">Create account</Button>
            <button onClick={onGuest} className="min-h-12 font-extrabold underline underline-offset-4 decoration-2 decoration-ac hover:text-ac" data-layer="Welcome/Continue as guest">Continue as guest</button>
          </div>
        </div>
      </main>
    </div>
  )
}

function Login({ go, onLogin }: { go: (s: Screen) => void; onLogin: (a: Account) => void }) {
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { onLogin(await api.login(id.trim().toLowerCase(), pw)) } // POST /api/auth/login
    catch (x) { setErr(x instanceof Error ? x.message : 'Could not log in') }
    finally { setBusy(false) }
  }
  return (
    <Shell photo={PHOTO.cook} alt="Chopping fresh vegetables in a home kitchen" quote="Welcome back. Let's cook.">
      <Heading sub="Log in to pick up your pantry, plans and saved meals.">Welcome back</Heading>
      <form onSubmit={submit} className="space-y-4" data-layer="Login">
        {err && <ErrorBox><Icon n="x" size={18} />{err}</ErrorBox>}
        <AuthInput id="login-id" label="Email" type="email" inputMode="email" value={id} onChange={(v) => { setId(v); setErr('') }} autoComplete="username" placeholder="you@example.com" error={!!err} disabled={busy} />
        <AuthInput id="login-pw" label="Password" type="password" value={pw} onChange={(v) => { setPw(v); setErr('') }} autoComplete="current-password" placeholder="Your password" error={!!err} disabled={busy} />
        <div className="text-right -mt-2"><LinkBtn onClick={() => go('forgot')}>Forgot password?</LinkBtn></div>
        <Button className="w-full !min-h-14 !text-lg" disabled={!id.trim() || !pw || busy} data-layer="Login/Log in Button">{busy ? <><Spinner />Logging in…</> : 'Log in'}</Button>
      </form>
      <p className="text-center mt-6 font-medium">New here? <LinkBtn onClick={() => go('signup')}>Create an account</LinkBtn></p>
      <p className="text-center"><LinkBtn onClick={() => go('welcome')}>Back</LinkBtn></p>
    </Shell>
  )
}

const RULES: [string, (p: string) => boolean][] = [['8+ characters', (p) => p.length >= 8], ['A number', (p) => /\d/.test(p)], ['Upper & lower case', (p) => /[a-z]/.test(p) && /[A-Z]/.test(p)], ['A symbol', (p) => /[^A-Za-z0-9]/.test(p)]]
function Signup({ go, onLogin, theme, setTheme, mode }: { go: (s: Screen) => void; onLogin: (a: Account) => void; theme: ThemeId; setTheme: (t: ThemeId) => void; mode: Mode }) {
  const [step, setStep] = useState(1); const [tried, setTried] = useState(false); const [busy, setBusy] = useState(false)
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  const [diet, setDiet] = useState('Vegetarian'); const [allergies, setAllergies] = useState<string[]>([]); const [kcal, setKcal] = useState(2000)
  const [terms, setTerms] = useState(false); const [done, setDone] = useState<Account | null>(null)
  const [srvErr, setSrvErr] = useState('') // message from the server, e.g. "email already exists"
  const score = RULES.filter(([, f]) => f(pw)).length
  const dupe = /exist/i.test(srvErr)
  const e1 = { name: !name.trim() && 'Enter your name', email: !emailOk(email) ? 'Enter a valid email' : srvErr, pw: !(pw.length >= 8 && /\d/.test(pw)) && 'Use 8+ characters and a number' }
  const next = () => { setTried(true); if (step === 1 && (e1.name || e1.email || e1.pw)) return; setTried(false); setStep(step + 1); scrollTo({ top: 0 }) }
  const create = async () => {
    setBusy(true)
    try { setDone(await api.register({ name: name.trim(), email: email.trim().toLowerCase(), password: pw, diet, allergies, kcal, theme })) } // POST /api/auth/register
    catch (x) { setSrvErr(x instanceof Error ? x.message : 'Could not create the account'); setStep(1); setTried(true) }
    finally { setBusy(false) }
  }
  const meter = ['#D1495B', '#FF8A1F', '#FFC857', '#17A06B'][Math.max(0, score - 1)]
  const FieldErr = ({ m }: { m: string | false }) => (tried && m ? <p role="alert" className="mt-1.5 inline-block rounded-lg bg-[#FFE0E3] text-[#7A1626] font-bold px-2.5 py-1 text-sm">{m}</p> : null)

  if (done) return (
    <Shell photo={PHOTO.fruit} alt="Bowl of fresh fruit" quote="You're in. Start cooking.">
      <div className="text-center space-y-5 rise" data-layer="Signup/Success">
        <div className="size-24 mx-auto rounded-full bg-ac text-acfg border-[3px] border-ink shadow-[4px_4px_0_var(--sh)] grid place-items-center pop"><Icon n="check" size={48} /></div>
        <h1 className="text-5xl sm:text-6xl leading-[.9]">You're in, {done.name.split(' ')[0]}!</h1>
        <p className="text-lg font-medium text-mute">Your account is ready. Chef AI is set to {done.diet.toLowerCase()} at {done.kcal} kcal a day.</p>
        <Button className="w-full !min-h-14 !text-lg" onClick={() => onLogin(done)}>Open Chef AI Kitchen</Button>
      </div>
    </Shell>
  )
  return (
    <Shell photo={PHOTO.jog} alt="Woman running along a path at golden hour" quote="Fuel the run. Cook the plan.">
      <div className="mb-5" data-layer="Signup/Progress">
        <div className="flex items-center justify-between mb-2"><span className="font-display text-2xl">Step {step} of 3</span>
          {step === 1 ? <LinkBtn onClick={() => go('welcome')}>Cancel</LinkBtn> : <LinkBtn onClick={() => setStep(step - 1)}>Back</LinkBtn>}</div>
        <div className="grid grid-cols-3 gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>{[1, 2, 3].map((i) => <div key={i} className={`h-4 rounded-full border-2 border-fg transition-all ${step >= i ? 'bg-ac' : ''}`} />)}</div>
      </div>
      {step === 1 && (
        <div className="space-y-4 rise">
          <Heading sub="Takes under a minute.">Create account</Heading>
          <div><AuthInput id="su-name" label="Name" value={name} onChange={setName} autoComplete="name" placeholder="Asha Rao" error={tried && !!e1.name} /><FieldErr m={e1.name} /></div>
          <div><AuthInput id="su-email" label="Email" type="email" inputMode="email" value={email} onChange={(v) => { setEmail(v); setSrvErr('') }} autoComplete="email" placeholder="you@example.com" error={tried && !!e1.email} /><FieldErr m={e1.email} />
            {tried && dupe && <button type="button" onClick={() => go('login')} className="block font-extrabold underline min-h-12">Log in instead</button>}</div>
          <div><AuthInput id="su-pw" label="Password" type="password" value={pw} onChange={setPw} autoComplete="new-password" placeholder="Create a password" error={tried && !!e1.pw} /><FieldErr m={e1.pw} />
            <div className="mt-3 flex gap-1.5" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className="h-2.5 flex-1 rounded-full border-2 border-fg/60" style={{ background: i < score ? meter : 'transparent' }} />)}</div>
            <p className="mt-1.5 text-sm font-extrabold uppercase tracking-[.12em]">Strength: {pw ? ['Weak', 'Weak', 'Okay', 'Good', 'Strong'][score] : '-'}</p>
            <div className="mt-2 flex flex-wrap gap-2">{RULES.map(([l, f]) => <span key={l} className={`inline-flex items-center gap-1 min-h-9 px-3 rounded-full text-sm font-bold border-2 ${f(pw) ? 'bg-ok text-okfg border-ok' : 'border-fg/60 text-fg'}`}>{f(pw) && <Icon n="check" size={13} />}{l}</span>)}</div></div>
        </div>)}
      {step === 2 && (
        <div className="space-y-6 rise">
          <Heading sub="Chef AI uses these to filter every suggestion.">Your food rules</Heading>
          <div><Label>Diet preference</Label><div className="flex flex-wrap gap-2 mt-2">{DIETS.map((d) => <Chip onBg key={d} selected={diet === d} onClick={() => setDiet(d)}>{d}</Chip>)}</div></div>
          <div><Label>Allergies</Label><div className="flex flex-wrap gap-2 mt-2">{ALLERGIES.map((a) => <Chip onBg key={a} selected={allergies.includes(a)} onClick={() => setAllergies((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]))}>{a}</Chip>)}</div></div>
          <Card className="p-4"><Slider label="Daily calorie goal" value={kcal} min={1200} max={3200} step={50} unit="KCAL" onChange={setKcal} /></Card>
        </div>)}
      {step === 3 && (
        <div className="space-y-5 rise">
          <Heading sub="You can switch any time from the palette button.">Pick your look</Heading>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button key={t.id} role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)} data-layer={`Theme Preview/${t.name}`}
                className={`text-left rounded-2xl border-[3px] p-2 bg-sf text-sfg transition-all active:scale-95 ${theme === t.id ? 'border-ac shadow-[0_0_0_3px_var(--ink)]' : 'border-ink'}`}>
                <div data-theme={t.id} data-mode={mode} className="rounded-xl overflow-hidden border-2 border-ink bg-bg text-fg h-24 relative">
                  <div className="bg-hd h-6 border-b-[3px] border-ac" />
                  <div className="p-2"><b className="font-display font-normal text-2xl leading-none block">EAT DESI</b><span className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-ac text-acfg text-[11px] font-extrabold border border-ink">Button</span></div>
                  {theme === t.id && <span className="absolute right-1.5 top-8 size-6 rounded-full bg-ok text-okfg grid place-items-center"><Icon n="check" size={14} /></span>}
                </div>
                <p className="font-display text-lg leading-none mt-2 px-1 pb-1">{t.name}</p>
              </button>))}
          </div>
          <label className="flex items-start gap-3 min-h-12 cursor-pointer font-medium"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="size-6 mt-0.5 accent-[#FF8A1F] shrink-0" /><span>I agree to the <b className="underline">Terms</b> and <b className="underline">Privacy Policy</b>.</span></label>
        </div>)}
      <div className="mt-6">
        {step < 3 ? <Button className="w-full !min-h-14 !text-lg" onClick={next}>Continue</Button>
          : <Button className="w-full !min-h-14 !text-lg" disabled={!terms || busy} onClick={create}>{busy ? <><Spinner />Creating…</> : 'Start cooking'}</Button>}
      </div>
    </Shell>
  )
}

function Forgot({ go }: { go: (s: Screen) => void }) {
  const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false)
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!emailOk(email)) { setErr('Enter a valid email address'); return } setBusy(true); await wait(600); setBusy(false); setSent(true) }
  return (
    <Shell photo={PHOTO.spices} alt="Colourful Indian spices" quote="No stress. We'll get you back in.">
      {sent ? (
        <div className="space-y-5 text-center rise" data-layer="Forgot/Confirmation">
          <div className="size-24 mx-auto rounded-full bg-ac text-acfg border-[3px] border-ink shadow-[4px_4px_0_var(--sh)] grid place-items-center pop"><Icon n="check" size={48} /></div>
          <h1 className="text-5xl sm:text-6xl leading-[.9]">Reset by email is not set up</h1>
          <p className="text-lg font-medium text-mute">This college project does not send emails yet. Ask the app admin to reset the password for <b className="text-fg break-all">{email.trim()}</b>, or create a new account.</p>
          <Button className="w-full !min-h-14 !text-lg" onClick={() => go('login')}>Back to log in</Button>
          <button onClick={() => setSent(false)} className="min-h-12 font-extrabold underline underline-offset-4 decoration-2 decoration-ac">Use a different email</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-layer="Forgot">
          <Heading sub="Enter your email and we'll send a link to reset it.">Forgot password?</Heading>
          {err && <ErrorBox><Icon n="x" size={18} />{err}</ErrorBox>}
          <AuthInput id="fg-email" label="Email" type="email" inputMode="email" value={email} onChange={(v) => { setEmail(v); setErr('') }} autoComplete="email" placeholder="you@example.com" error={!!err} disabled={busy} />
          <Button className="w-full !min-h-14 !text-lg" disabled={!email.trim() || busy}>{busy ? <><Spinner />Sending…</> : 'Send reset link'}</Button>
          <p className="text-center"><LinkBtn onClick={() => go('login')}>Back to log in</LinkBtn></p>
        </form>)}
    </Shell>
  )
}
