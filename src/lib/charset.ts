export type Category = 'capital' | 'lowercase' | 'number' | 'punctuation'
export interface Character { char: string; category: Category; hint: string }
const capitals = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(char => ({ char, category: 'capital' as const, hint: `Capital ${char}. Reach for the top line.` }))
const lowercase = [...'abcdefghijklmnopqrstuvwxyz'].map(char => ({ char, category: 'lowercase' as const, hint: `Lowercase ${char}. Let it find its natural rhythm.` }))
const numbers = [...'0123456789'].map(char => ({ char, category: 'number' as const, hint: `Number ${char}. Keep it steady on the baseline.` }))
const punctuation = [...`.,;:!?'"-_()[]/\\@#$%&*+=<>~`].map(char => ({ char, category: 'punctuation' as const, hint: `${char}. A small mark makes a difference.` }))
export const CHARSET: Character[] = [...capitals, ...lowercase, ...numbers, ...punctuation]
export const GROUPS: { label: string; start: number; end: number }[] = [
  { label: 'A–Z', start: 0, end: capitals.length },
  { label: 'a–z', start: capitals.length, end: capitals.length + lowercase.length },
  { label: '0–9', start: capitals.length + lowercase.length, end: capitals.length + lowercase.length + numbers.length },
  { label: 'Marks', start: capitals.length + lowercase.length + numbers.length, end: CHARSET.length },
]
export const nextUnfinished = (glyphs: Record<string, unknown>, from = 0) => {
  for (let step = 1; step <= CHARSET.length; step++) {
    const index = (from + step) % CHARSET.length
    if (!glyphs[CHARSET[index].char]) return index
  }
  return CHARSET.length
}
