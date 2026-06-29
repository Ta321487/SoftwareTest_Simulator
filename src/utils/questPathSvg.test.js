import { describe, it, expect } from 'vitest'
import { buildNodePath, getPathLength, getProgressRatio } from './questPathSvg.js'

describe('questPathSvg', () => {
  it('builds polyline through points in order', () => {
    const d = buildNodePath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
    ])
    expect(d).toBe('M 0.0 0.0 L 10.0 0.0 L 10.0 20.0')
  })

  it('measures path length', () => {
    const len = getPathLength([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
    ])
    expect(len).toBe(5)
  })

  it('computes progress through completed nodes', () => {
    const nodes = [
      { status: 'completed' },
      { status: 'completed' },
      { status: 'available' },
      { status: 'locked' },
    ]
    expect(getProgressRatio(nodes)).toBeGreaterThan(0.5)
    expect(getProgressRatio(nodes)).toBeLessThan(1)
  })
})
