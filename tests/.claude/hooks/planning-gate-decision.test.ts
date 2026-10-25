import { describe, expect, it } from 'bun:test'
import { decidePlanningWrite } from '../../../.claude/hooks/planning-gate-decision.ts'

describe('decidePlanningWrite', () => {
  it('when a plan file is written and planning was never loaded, denies it', () => {
    const filePath = '/Users/kane/.claude/plans/alp.12-thing.md'
    const transcript = '{"name":"Skill","input":{"skill":"plan"}}'

    const result = decidePlanningWrite({ filePath, transcript })

    expect(result).toEqual({
      decision: 'deny',
      reason:
        'Load the planning skill (/planning) before writing a plan file; AGENTS.md § Planning requires it.',
    })
  })

  it('when a plan file is written after the planning skill tool call, allows it', () => {
    const filePath = '/Users/kane/.claude/plans/alp.12-thing.md'
    const transcript = '{"name":"Skill","input":{"skill":"planning"}}'

    const result = decidePlanningWrite({ filePath, transcript })

    expect(result).toBeUndefined()
  })

  it('when a plan file is written after the user ran /planning, allows it', () => {
    const filePath = '/Users/kane/.claude/plans/alp.12-thing.md'
    const transcript = '<command-name>/planning</command-name>'

    const result = decidePlanningWrite({ filePath, transcript })

    expect(result).toBeUndefined()
  })

  it('when the file is not a plan file, has no opinion', () => {
    const filePath = 'src/tui/install/steps/done.ts'
    const transcript = ''

    const result = decidePlanningWrite({ filePath, transcript })

    expect(result).toBeUndefined()
  })
})
