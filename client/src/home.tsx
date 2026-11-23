import { PHOTO, type Recipe } from './data'
import { Bento } from './recipes'
import type { Ctx } from './shared'
import { Button, CutOut, Icon, Stat } from './ui'

// Names of the featured recipes (stored in the database, see server/data/featured_recipes.json)
const FEATURED = ['Palak Paneer with Roti', 'Chicken Tikka Bowl', 'Pav Bhaji', 'Chickpea Quinoa Bowl', 'Kanda Poha', 'Idli with Sambar', 'Goan Fish Curry']
const TICK = ['MOVE', 'COOK', 'EAT DESI', 'REPEAT', 'PROTEIN', 'PRO PREP', 'FUEL UP']
export function Home({ ctx }: { ctx: Ctx }) {
  const feat = FEATURED.map((n) => ctx.recipes.find((r) => r.featured && r.name === n)).filter(Boolean) as Recipe[]
  const avg = Math.round(ctx.recipes.reduce((a, r) => a + r.time, 0) / ctx.recipes.length)
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-hd text-white diag-b pb-24 md:pb-32">
        <img src={PHOTO.thali} alt="Colourful Indian thali with dal, vegetables and flatbread" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/20 md:via-black/55" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-20">
          <p className="inline-block bg-ac text-acfg font-extrabold text-xs uppercase tracking-[.2em] px-3 py-1.5 -rotate-1 border-2 border-ink">Indian meal prep for active people</p>
          <h1 className="mt-5 text-[clamp(3.25rem,12vw,9rem)] leading-[.88]">Eat desi.<br /><span className="text-ac">Move</span> faster.</h1>
          <p className="mt-5 max-w-lg text-lg font-medium text-white/95">Tell Chef AI what is in your kitchen. Get regional Indian recipes, macros, daily and weekly plans, and a shopping list that builds itself.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="!text-lg !min-h-14 !px-8" onClick={() => ctx.go('chef')}>Open Chef AI Kitchen <Icon n="arrow" /></Button>
            <Button variant="secondary" className="!text-lg !min-h-14 !px-8" onClick={() => ctx.go('recipes')}>Browse recipes</Button>
          </div>
          <dl className="mt-10 grid grid-cols-3 max-w-xl gap-4">
            {([[ctx.recipes.length, 'Recipes'], [avg, 'Avg minutes'], [4, 'Meals a day']] as const).map(([v, l], i) => (
              <div key={l} className={`border-l-4 pl-3 ${['border-ac', 'border-[#FFC857]', 'border-white'][i]}`}><dd className="font-display text-5xl md:text-6xl leading-none">{v}</dd><dt className="text-[11px] font-extrabold uppercase tracking-[.16em] mt-1">{l}</dt></div>))}
          </dl>
        </div>
        <CutOut src={PHOTO.chilli} size={110} className="absolute right-[6%] bottom-10 md:bottom-16 rotate-12 hidden sm:block" />
        <CutOut src={PHOTO.lemon} size={140} className="absolute right-[16%] top-16 -rotate-6 hidden md:block" />
        <CutOut src={PHOTO.tomato} size={90} className="absolute right-4 top-28 rotate-6" />
        <CutOut src={PHOTO.mint} size={100} className="absolute right-[24%] bottom-8 -rotate-12 hidden md:block" />
      </section>

      {/* HOW IT WORKS BENTO */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-16 relative z-10">
        <div className="grid md:grid-cols-6 md:auto-rows-[190px] gap-4">
          <div className="relative md:col-span-3 md:row-span-2 min-h-72 rounded-3xl overflow-hidden border-2 border-ink shadow-[6px_6px_0_var(--sh)] text-white flex items-end">
            <img src={PHOTO.cook} alt="Cooking vegetables at home" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative p-6"><span className="font-display text-7xl outline-num text-white leading-none">01</span><h2 className="text-5xl leading-none">Stock your<br />pantry</h2><p className="mt-2 max-w-xs font-medium">Tap sticker chips for what you have. Chef AI matches every recipe against them.</p></div>
          </div>
          <button onClick={() => ctx.go('chef')} className="md:col-span-3 text-left rounded-3xl bg-ac text-acfg border-2 border-ink shadow-[6px_6px_0_var(--sh)] p-6 hover:-translate-y-1 transition min-h-44"><span className="font-display text-7xl outline-num leading-none">02</span><h2 className="text-5xl leading-none">Ask Chef AI</h2><p className="font-bold mt-1">Recipes, macros, daily and weekly plans.</p></button>
          <div className="md:col-span-2 rounded-3xl bg-sf text-sfg border-2 border-ink shadow-[6px_6px_0_var(--sh)] p-6 flex flex-col justify-between"><span className="font-display text-7xl outline-num leading-none">03</span><div><h2 className="text-4xl leading-none">Shop &amp; cook</h2><p className="font-medium text-smute">Missing items go straight to your list.</p></div></div>
          <div className="relative rounded-3xl overflow-hidden border-2 border-ink shadow-[6px_6px_0_var(--sh)] min-h-40"><img src={PHOTO.yoga} alt="Woman practising yoga at sunrise" className="absolute inset-0 size-full object-cover" /></div>
        </div>
      </section>

      {/* ACTIVE STRIP */}
      <section className="mt-16 md:mt-24 bg-ac text-acfg diag-both py-14 md:py-20 overflow-hidden" aria-label="Active lifestyle">
        <div className="flex whitespace-nowrap ticker font-display text-6xl md:text-8xl leading-none w-max" aria-hidden>
          {[...TICK, ...TICK].map((t, i) => <span key={i} className="px-6">{t}<span className="text-hd mx-4">/</span></span>)}
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-6 gap-3 md:gap-4 h-48 md:h-72">
          {([[PHOTO.jog, 'Woman running along a path at golden hour', 'col-span-3 md:col-span-2'], [PHOTO.cycle, 'Two cyclists riding a coastal road', 'col-span-3 md:col-span-2'], [PHOTO.stretch, 'Woman stretching on a mountain top at sunrise', 'hidden md:block md:col-span-1'], [PHOTO.fruit, 'Bowl of fresh sliced fruit', 'hidden md:block md:col-span-1']] as const).map(([s, a, c], i) => (
            <img key={a} src={s} alt={a} loading="lazy" className={`size-full object-cover rounded-3xl border-2 border-ink shadow-[4px_4px_0_var(--sh)] ${c} ${i % 2 ? 'mt-6' : '-mt-2'}`} />))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20 relative">
        <div className="flex items-end justify-between gap-4 mb-6"><div><span className="font-display text-6xl outline-num leading-none">TOP</span><h2 className="text-5xl md:text-7xl leading-[.9]">This week's fuel</h2></div>
          <Button variant="dark" className="hidden sm:inline-flex" onClick={() => ctx.go('recipes')}>All recipes <Icon n="arrow" /></Button></div>
        <Bento list={feat} ctx={ctx} />
        <CutOut src={PHOTO.spices} size={120} className="absolute -right-2 md:right-4 -top-4 rotate-12 hidden sm:block" />
        <div className="mt-10 sm:hidden"><Button className="w-full" onClick={() => ctx.go('recipes')}>All recipes</Button></div>
      </section>
    </div>
  )
}
