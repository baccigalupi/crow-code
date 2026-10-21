import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { DoneMessage } from '../../../../../src/tui/install/views/steps/done-message.tsx'

describe('done-message', () => {
  it('when rendered, reports the written config path', () => {
    const message = <DoneMessage crowConfigPath='.crow/config.json' />

    const { lastFrame } = render(message)

    expect(lastFrame()).toContain('Wrote config to .crow/config.json')
    expect(lastFrame()).toContain('press any key to exit')
  })
})
