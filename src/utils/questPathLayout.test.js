import { describe, it, expect } from 'vitest'
import { getSerpentineLayout, getSerpentineRowCount } from './questPathLayout.js'

describe('getSerpentineLayout', () => {
  it('places first row left to right', () => {
    const nodes = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }))
    const layout = getSerpentineLayout(nodes, 4)
    expect(layout.slice(0, 4).map((n) => n.col)).toEqual([0, 1, 2, 3])
    expect(layout[0].connector).toBe('right')
    expect(layout[3].connector).toBe('down')
    expect(layout[4].connector).toBe('none')
  })

  it('reverses second row', () => {
    const nodes = Array.from({ length: 8 }, (_, i) => ({ id: i + 1 }))
    const layout = getSerpentineLayout(nodes, 4)
    expect(layout[4].col).toBe(3)
    expect(layout[5].col).toBe(2)
    expect(layout[4].connector).toBe('left')
    expect(layout[7].connector).toBe('none')
  })
})

describe('getSerpentineRowCount', () => {
  it('counts rows for partial last row', () => {
    expect(getSerpentineRowCount(13, 4)).toBe(4)
    expect(getSerpentineRowCount(4, 4)).toBe(1)
  })
})
