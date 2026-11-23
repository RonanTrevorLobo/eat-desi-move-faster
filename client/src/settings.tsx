import { THEMES, type Mode, type ThemeId } from './theme'
import { Button, Icon, Stat, Toggle } from './ui'

export function ThemePreview({ id, mode }: { id: ThemeId; mode: Mode }) {
  return (
    <div data-theme={id} data-mode={mode} className="rounded-2xl border-2 border-ink overflow-hidden bg-bg text-fg">
      <div className="bg-hd text-hdfg px-3 py-2 border-b-4 border-ac flex justify-between items-center"><span className="font-display text-lg">Meal Prep</span><span className="flex gap-1">{[0, 1, 2].map((i) => <i key={i} className="size-2 rounded-full bg-hdfg/70" />)}</span></div>
      <div className="p-3 space-y-3">
        <p className="font-display text-4xl leading-[.9]">Eat desi.<br /><span className="text-ac">Move</span> faster.</p>
        <div className="bg-sf text-sfg border-2 border-ink rounded-xl p-2.5 flex items-center justify-between shadow-[3px_3px_0_var(--sh)]">
          <Stat v={420} l="kcal" size="text-4xl" /><div className="flex flex-col gap-1.5 items-end"><span className="px-3 py-1 rounded-full bg-ac text-acfg border-2 border-ink text-sm font-extrabold">Button</span><span className="px-2.5 py-0.5 rounded-full bg-ok text-okfg text-xs font-bold">You have it</span></div>
        </div>
      </div>
    </div>
  )
}

export function ThemePicker({ theme, setTheme, mode, setMode, compact, onSettings }: { theme: ThemeId; setTheme: (t: ThemeId) => void; mode: Mode; setMode: (m: Mode) => void; compact?: boolean; onSettings?: () => void }) {
  return (
    <div className="space-y-4">
      <div className={compact ? 'space-y-3' : 'grid sm:grid-cols-2 xl:grid-cols-4 gap-5'} role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button key={t.id} role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)}
            className={`text-left rounded-3xl border-[3px] p-3 transition-all hover:-translate-y-1 active:scale-[.98] bg-sf text-sfg ${theme === t.id ? 'border-ac shadow-[0_0_0_4px_var(--ink),5px_5px_0_4px_var(--sh)]' : 'border-ink'}`}>
            {!compact && <ThemePreview id={t.id} mode={mode} />}
            <div className={`flex items-center gap-3 ${compact ? '' : 'mt-3'}`}>
              <span className="flex -space-x-1.5">{t.sw.map((c) => <i key={c} className="size-7 rounded-full border-2 border-[#0B1F3A]" style={{ background: c }} />)}</span>
              {theme === t.id && <span className="ml-auto inline-flex items-center gap-1 bg-ac text-acfg border-2 border-ink rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase"><Icon n="check" size={12} />Active</span>}
            </div>
            <p className="font-display text-2xl leading-none mt-2">{t.name}</p>
            {!compact && <p className="text-sm text-smute mt-1">{t.blurb}</p>}
          </button>))}
      </div>
      <div className="bg-sf text-sfg border-2 border-ink rounded-2xl px-4"><Toggle label={mode === 'dark' ? 'Dark mode' : 'Light mode'} checked={mode === 'dark'} onChange={(b) => setMode(b ? 'dark' : 'light')} /></div>
      {onSettings && <Button variant="dark" className="w-full" onClick={onSettings}>Open theme settings</Button>}
    </div>
  )
}

export function Settings(p: { theme: ThemeId; setTheme: (t: ThemeId) => void; mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="space-y-6">
      <div><span className="font-display text-6xl outline-num leading-none">06</span><h2 className="text-5xl md:text-7xl leading-[.9]">Theme &amp; settings</h2>
        <p className="mt-2 max-w-xl text-mute font-medium">Four palettes, each with light and dark. Every screen follows your choice instantly.</p></div>
      <ThemePicker {...p} />
    </div>
  )
}
