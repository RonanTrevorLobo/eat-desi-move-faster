import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

const P: Record<string, string> = {
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  book: 'M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5zM6.5 17H20v4H6.5',
  plus: 'M12 5v14M5 12h14', heart: 'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z',
  cart: 'M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20h.01M18 20h.01',
  chevron: 'M6 9l6 6 6-6', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3', x: 'M18 6L6 18M6 6l12 12', check: 'M5 13l4 4L19 7',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z', sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  dots: 'M12 5h.01M12 12h.01M12 19h.01', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', image: 'M4 4h16v16H4zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20 15l-5-5L5 20',
  palette: 'M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A3.6 3.6 0 0 0 21 11c0-4.4-4-8-9-8zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
  home: 'M3 11l9-8 9 8v10h-6v-6H9v6H3z', arrow: 'M5 12h14M13 6l6 6-6 6',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeoff: 'M3 3l18 18M10.6 6.2A9.7 9.7 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.7 8.4 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  play: 'M8 5v14l11-7z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9', right: 'M9 6l6 6-6 6',
}
export const Icon = ({ n, filled, size = 20 }: { n: string; filled?: boolean; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={P[n]} /></svg>
)
export function useIsMobile() {
  const q = '(max-width: 767px)'
  const [m, setM] = useState(() => matchMedia(q).matches)
  useEffect(() => { const l = matchMedia(q); const f = () => setM(l.matches); l.addEventListener('change', f); return () => l.removeEventListener('change', f) }, [])
  return m
}

const HARD = 'border-2 border-ink shadow-[3px_3px_0_var(--sh)] hover:-translate-y-0.5 hover:shadow-[4px_5px_0_var(--sh)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
type BV = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger'
const BVS: Record<BV, string> = {
  primary: `bg-ac text-acfg ${HARD}`, secondary: `bg-sf text-sfg ${HARD}`, dark: `bg-hd text-hdfg ${HARD}`,
  danger: `bg-err text-white ${HARD}`, ghost: 'text-inherit hover:bg-black/10 active:bg-black/20',
}
export function Button({ variant = 'primary', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BV }) {
  return <button {...p} className={`inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-full font-extrabold text-base tracking-wide transition-all outline-none focus-visible:ring-4 ring-ac2 ring-offset-2 ring-offset-bg disabled:opacity-45 disabled:grayscale disabled:pointer-events-none ${BVS[variant]} ${className}`} />
}
export function IconButton({ label, className = '', children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button {...p} aria-label={label} className={`size-12 shrink-0 grid place-items-center rounded-full transition active:scale-90 hover:bg-black/10 outline-none focus-visible:ring-4 ring-ac2 disabled:opacity-40 ${className}`}>{children}</button>
}
export function Chip({ selected, onClick, onRemove, children, className = '', onBg }: { selected?: boolean; onClick?: () => void; onRemove?: () => void; children: ReactNode; className?: string; onBg?: boolean }) {
  const base = `inline-flex items-center gap-1.5 min-h-12 md:min-h-10 rounded-full border-2 text-base font-bold whitespace-nowrap transition-all outline-none focus-visible:ring-4 ring-ac2 ${className}`
  const tone = selected ? 'bg-ac text-acfg border-ink shadow-[2px_2px_0_var(--sh)] -translate-y-0.5' : onBg ? 'bg-transparent text-fg border-fg hover:bg-fg/15' : 'bg-sf text-sfg border-ink hover:bg-tint'
  if (onRemove) return <span className={`${base} ${tone} pl-4 pr-1`}>{children}<button aria-label="Remove" onClick={onRemove} className="size-8 grid place-items-center rounded-full hover:bg-black/15"><Icon n="x" size={14} /></button></span>
  return <button type="button" onClick={onClick} aria-pressed={selected} className={`${base} ${tone} px-4 active:scale-95 active:translate-y-0`}>{children}</button>
}
export const Tag = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-[.12em] border-2 border-ink bg-ac2 text-ac2fg ${className}`}>{children}</span>
)
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`bg-sf text-sfg border-2 border-ink rounded-3xl shadow-[5px_5px_0_var(--sh)] ${className}`}>{children}</div>
)
export const inputCls = 'w-full min-h-[52px] rounded-xl border-2 border-ink bg-white text-[#0B1F3A] px-4 py-2 text-base font-medium outline-none transition focus:ring-4 ring-ac placeholder:text-[#5B6B80] disabled:opacity-50'
export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[.14em]">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? <p role="alert" className="text-sm font-bold text-err mt-1">{error}</p> : hint ? <p className="text-sm text-smute mt-1">{hint}</p> : null}
    </label>
  )
}
export function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-end justify-between"><span className="text-xs font-extrabold uppercase tracking-[.14em]">{label}</span><span className="font-display text-3xl leading-none">{value}<small className="text-sm ml-1 tracking-wider">{unit}</small></span></div>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </div>
  )
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (b: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center justify-between w-full min-h-12 font-bold text-base">
      {label}
      <span className={`w-14 h-8 rounded-full p-1 border-2 border-ink transition ${checked ? 'bg-ac' : 'bg-black/15'}`}><span className={`block size-5 rounded-full bg-ink transition ${checked ? 'translate-x-6' : ''}`} /></span>
    </button>
  )
}
export const Stat = ({ v, l, className = '', size = 'text-4xl' }: { v: ReactNode; l: string; className?: string; size?: string }) => (
  <div className={className}><b className={`font-display font-normal leading-none block ${size}`}>{v}</b><span className="block text-[11px] font-extrabold uppercase tracking-[.16em] mt-1">{l}</span></div>
)
export function Ring({ value, max, label, color, size = 72 }: { value: number; max: number; label: string; color: string; size?: number }) {
  const r = 26, c = 2 * Math.PI * r, pct = Math.min(1, value / max)
  return (
    <div className="text-center" role="img" aria-label={`${label} ${value} grams`}>
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg viewBox="0 0 64 64" width={size} height={size} className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="10" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .6s' }} />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-xl">{value}</span>
      </div>
      <span className="block text-[11px] font-extrabold uppercase tracking-[.14em] mt-1">{label}</span>
    </div>
  )
}
export const RING_COLORS = { p: '#1B8A5A', c: '#E08A00', f: '#D1495B' }

export const Mascot = ({ size = 48 }: { size?: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
    <circle cx="32" cy="36" r="21" fill="var(--ac)" stroke="var(--ink)" strokeWidth="3" />
    <path d="M17 26c-6-1-8-9-2-12 2-6 9-6 12-1 3-4 10-3 11 1 6 0 8 8 3 12z" fill="#fff" stroke="#0B1F3A" strokeWidth="3" strokeLinejoin="round" />
    <rect x="18" y="24" width="28" height="7" rx="2.5" fill="#fff" stroke="#0B1F3A" strokeWidth="3" />
    <circle cx="25" cy="42" r="2.6" fill="var(--ink)" /><circle cx="39" cy="42" r="2.6" fill="var(--ink)" />
    <path d="M25 48q7 6 14 0" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
  </svg>
)
export const CutOut = ({ src, size = 96, className = '', alt = '' }: { src: string; size?: number; className?: string; alt?: string }) => (
  <img src={src} alt={alt} aria-hidden={!alt} style={{ width: size, height: size }} className={`rounded-full object-cover border-[5px] border-white shadow-[4px_5px_0_var(--sh)] pointer-events-none select-none ${className}`} />
)

export function Sheet({ open, onClose, title, children, side }: { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: boolean }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  const pos = side
    ? 'bottom-0 inset-x-0 max-h-[90vh] rounded-t-[2rem] md:inset-x-auto md:top-0 md:right-0 md:w-[440px] md:max-h-none md:h-full md:rounded-t-none md:rounded-l-[2rem]'
    : 'bottom-0 inset-x-0 max-h-[92vh] rounded-t-[2rem] md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] md:max-h-[90vh] md:rounded-[2rem]'
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={title}>
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />
      <div className={`rise absolute bg-sf text-sfg flex flex-col border-4 border-ink shadow-2xl ${pos}`}>
        <div className="md:hidden mx-auto mt-2 h-1.5 w-12 rounded-full bg-sfg/30" />
        <div className="flex items-center justify-between pl-5 pr-2 pt-2">
          <h2 className="text-3xl leading-none py-2">{title}</h2>
          <IconButton label="Close" onClick={onClose}><Icon n="x" /></IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-2 flex-1">{children}</div>
      </div>
    </div>
  )
}
export function Select({ label, value, options, onChange, placeholder = 'Select', error }: { label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const mobile = useIsMobile(); const [o, setO] = useState(false)
  return (
    <Field label={label} error={error}>
      {mobile ? (<>
        <button type="button" onClick={() => setO(true)} className={`${inputCls} flex items-center justify-between text-left ${error ? 'border-err' : ''}`}><span className={value ? '' : 'text-[#5B6B80]'}>{value || placeholder}</span><Icon n="chevron" /></button>
        <Sheet open={o} onClose={() => setO(false)} title={label}>
          <ul className="space-y-2">{options.map((x) => <li key={x}><button type="button" onClick={() => { onChange(x); setO(false) }} className={`w-full min-h-12 flex items-center justify-between px-4 rounded-xl border-2 border-ink font-bold text-left ${x === value ? 'bg-ac text-acfg' : 'bg-white'}`}>{x}{x === value && <Icon n="check" />}</button></li>)}</ul>
        </Sheet></>
      ) : (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${error ? 'border-err' : ''}`}><option value="">{placeholder}</option>{options.map((x) => <option key={x}>{x}</option>)}</select>
      )}
    </Field>
  )
}
