import { describe, expect, it } from 'bun:test'
import { tuiBoundariesPlugin } from '../../../agents/style-checks/tui-boundaries-plugin.ts'

describe('tuiBoundariesPlugin', () => {
  it('when the plugin is built, lists the one rule', () => {
    const plugin = tuiBoundariesPlugin

    const rules = plugin.rules

    expect(plugin.name).toBe('crow-style-tui')
    expect(rules).toHaveLength(1)
    expect(rules[0].name).toBe('tui-import-boundaries')
  })
})
