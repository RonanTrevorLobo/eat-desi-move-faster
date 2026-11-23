export type ThemeId = 'sun' | 'green' | 'spice' | 'clean'
export type Mode = 'dark' | 'light'
export const THEMES: { id: ThemeId; name: string; blurb: string; sw: string[] }[] = [
  { id: 'sun', name: 'Desert Sun + Dark Blue', blurb: 'Navy nights, sun-baked orange and sand.', sw: ['#0B1F3A', '#FF8A1F', '#FFC857', '#FFF3DC', '#D1495B'] },
  { id: 'green', name: 'Fresh Green + Charcoal', blurb: 'Charcoal base with vivid lime and leaf green.', sw: ['#14181C', '#B5F23D', '#1FA45B', '#F6FBEF', '#FF6B4A'] },
  { id: 'spice', name: 'Spice Market', blurb: 'Maroon, turmeric, chilli red and teal.', sw: ['#4A0E1B', '#F4B400', '#E63B2E', '#FFF8EC', '#0E7C7B'] },
  { id: 'clean', name: 'Clean Light', blurb: 'Calm greys and white with one bold orange.', sw: ['#FFFFFF', '#F3F5F8', '#FF8A1F', '#0B1F3A', '#D1495B'] },
]
