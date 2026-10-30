import { describe, expect, it } from 'bun:test'
import { tuiViewBoundariesPlugin } from '../../../agents/style-checks/tui-view-boundaries-plugin.ts'

describe('tuiViewBoundariesPlugin', () => {
  it('when the plugin is built, lists the one rule', () => {
    const plugin = tuiViewBoundariesPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-tui-views')
    expect(rules).toHaveLength(1)
    expect(rules[0].name).toBe('tui-view-imports')
  })
})
