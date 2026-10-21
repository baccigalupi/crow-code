import { describe, expect, it } from 'bun:test'
import { installAppViewModel } from '../../../../src/tui/install/views/install-app-view-model.ts'

describe('install-app-view-model', () => {
  it('when stdout reports dimensions, uses them', () => {
    const stdout = { rows: 40, columns: 120 } as NodeJS.WriteStream

    const { rowHeight, columnWidth } = installAppViewModel({ stdout })

    expect(rowHeight).toBe(40)
    expect(columnWidth).toBe(120)
  })

  it('when stdout reports no dimensions, falls back to defaults', () => {
    const stdout = { rows: 0, columns: 0 } as NodeJS.WriteStream

    const { rowHeight, columnWidth } = installAppViewModel({ stdout })

    expect(rowHeight).toBe(24)
    expect(columnWidth).toBe(80)
  })
})
