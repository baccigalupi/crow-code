import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { DoneMessage } from '../../../../../src/tui/install/views/steps/done-message.tsx'

describe('done-message', () => {
  it('when the step is not done, renders nothing', () => {
    const message = (
      <DoneMessage step='confirm' crowConfigPath='.crow/config.json' />
    )

    const { lastFrame } = render(message)

    expect(lastFrame()).toBe('')
  })

  it('when done, reports the written config path', () => {
    const message = (
      <DoneMessage step='done' crowConfigPath='.crow/config.json' />
    )

    const { lastFrame } = render(message)

    expect(lastFrame()).toContain('Wrote config to .crow/config.json')
    expect(lastFrame()).toContain('press any key to exit')
  })
})
