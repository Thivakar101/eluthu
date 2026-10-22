import { init, potrace } from 'esm-potrace-wasm'
import type { Box } from './processing'

let ready: Promise<void> | undefined
const tokenPattern = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi

function normalizePotracePath(data: string, scale: number, dx: number, dy: number): string {
  const tokens = data.match(tokenPattern) || []
  const result: string[] = []
  let i = 0, command = '', x = 0, y = 0, startX = 0, startY = 0
  const pair = (pointX: number, pointY: number) => `${(pointX * scale + dx).toFixed(1)} ${(pointY * scale + dy).toFixed(1)}`
  const number = () => Number(tokens[i++])
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) command = tokens[i++]
    if (!command) throw new Error('The traced path is incomplete.')
    const lower = command.toLowerCase(), relative = command === lower
    if (lower === 'z') { result.push('Z'); x = startX; y = startY; command = ''; continue }
    if (lower === 'm' || lower === 'l') {
      const px = number(), py = number()
      if (!Number.isFinite(px) || !Number.isFinite(py)) throw new Error('The traced path is incomplete.')
      x = relative ? x + px : px; y = relative ? y + py : py
      if (lower === 'm') { startX = x; startY = y; result.push(`M ${pair(x, y)}`); command = relative ? 'l' : 'L' }
      else result.push(`L ${pair(x, y)}`)
    } else if (lower === 'h' || lower === 'v') {
      const value = number()
      if (!Number.isFinite(value)) throw new Error('The traced path is incomplete.')
      if (lower === 'h') x = relative ? x + value : value
      else y = relative ? y + value : value
      result.push(`L ${pair(x, y)}`)
    } else if (lower === 'c' || lower === 'q') {
      const count = lower === 'c' ? 6 : 4
      const values = Array.from({ length: count }, number)
      if (values.some(value => !Number.isFinite(value))) throw new Error('The traced path is incomplete.')
      const originX = x, originY = y
      const coords: string[] = []
      for (let j = 0; j < count; j += 2) coords.push(pair(relative ? originX + values[j] : values[j], relative ? originY + values[j + 1] : values[j + 1]))
      x = relative ? originX + values[count - 2] : values[count - 2]
      y = relative ? originY + values[count - 1] : values[count - 1]
      result.push(`${lower.toUpperCase()} ${coords.join(' ')}`)
    } else throw new Error(`Unsupported traced path command: ${command}`)
  }
  return result.join(' ')
}

export async function tracePotrace(binary: Uint8Array, width: number, height: number, region: Box): Promise<string> {
  const left = Math.max(0, Math.floor(region.x))
  const top = Math.max(0, Math.floor(region.y))
  const right = Math.min(width, Math.ceil(region.x + region.width))
  const bottom = Math.min(height, Math.ceil(region.y + region.height))
  const w = right - left
  const h = bottom - top
  if (w < 1 || h < 1) return ''

  const image = new ImageData(w, h)
  let ink = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dark = binary[(top + y) * width + left + x] === 1
    const value = dark ? 0 : 255
    const offset = (y * w + x) * 4
    image.data[offset] = value
    image.data[offset + 1] = value
    image.data[offset + 2] = value
    image.data[offset + 3] = 255
    if (dark) ink++
  }
  if (!ink) return ''

  ready ??= init()
  await ready
  const paths = await potrace(image, {
    turdsize: Math.max(2, Math.round(w * h * .00005)),
    turnpolicy: 4,
    alphamax: 1,
    opticurve: 1,
    opttolerance: .2,
    pathonly: true,
    extractcolors: false,
    posterizelevel: 1,
  })
  // Potrace emits SVG coordinates at 10 raster units per pixel.
  const rasterScale = Math.min(800 / w, 700 / h)
  const x = (1000 - w * rasterScale) / 2
  const y = (1000 - h * rasterScale) / 2
  return paths.map(path => normalizePotracePath(path, rasterScale / 10, x, y)).join(' ')
}
