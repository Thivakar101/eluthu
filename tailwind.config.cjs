module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { paper:'var(--paper)', raised:'var(--paper-raised)', sunken:'var(--paper-sunken)', ink:'var(--ink)', soft:'var(--ink-soft)', faint:'var(--ink-faint)', line:'var(--line)', accent:'var(--accent)' },
    fontFamily: { display:['Fraunces','Georgia','serif'], ui:['Inter','Arial','sans-serif'] },
    maxWidth: { content:'1120px', coach:'760px' },
    borderRadius: { card:'20px', tile:'14px', sheet:'24px' }
  } },
  plugins: []
}
