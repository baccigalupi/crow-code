import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { installViewModel } from '../../../../src/tui/install/views/install-view-model.ts'

describe('install-view-model', () => {
  it('when stdout reports dimensions, uses them', () => {
    const stdout = { rows: 40, columns: 120 } as NodeJS.WriteStream

    const { rowHeight, columnWidth } = installViewModel({ stdout })

    expect(rowHeight).toBe(40)
    expect(columnWidth).toBe(120)
  })

  it('when stdout reports no dimensions, falls back to defaults', () => {
    const stdout = { rows: 0, columns: 0 } as NodeJS.WriteStream

    const { rowHeight, columnWidth } = installViewModel({ stdout })

    expect(rowHeight).toBe(24)
    expect(columnWidth).toBe(80)
  })
})
