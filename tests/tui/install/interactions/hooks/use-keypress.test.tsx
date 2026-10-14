import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import {
  KeypressProbe,
  keypressSignals,
} from '../../../../support/keypress-probe.tsx'
import { settle } from '../../../../support/settle.ts'

describe('useKeypress', () => {
  it('when a char arrives, edits the active directory input', async () => {
    const signals = keypressSignals('repo')
    const { stdin, unmount } = render(<KeypressProbe signals={signals} />)

    stdin.write('x')
    await settle()

    expect(signals.repoDirectory.peek().text).toBe('x')
    unmount()
  })

  it('when return arrives, advances the step', async () => {
    const signals = keypressSignals('repo')
    const { stdin, unmount } = render(<KeypressProbe signals={signals} />)

    stdin.write('\r')
    await settle()

    expect(signals.step.peek()).toBe('user')
    unmount()
  })

  it('when return arrives on the user step, advances to the env step', async () => {
    const signals = keypressSignals('user')
    const { stdin, unmount } = render(<KeypressProbe signals={signals} />)

    stdin.write('\r')
    await settle()

    expect(signals.step.peek()).toBe('env')
    unmount()
  })

  it('when a char arrives on the env step, edits the env input', async () => {
    const signals = keypressSignals('env')
    const { stdin, unmount } = render(<KeypressProbe signals={signals} />)

    stdin.write('x')
    await settle()

    expect(signals.envFile.peek().text).toBe('x')
    unmount()
  })

  it('when return arrives on the env step, advances to confirm', async () => {
    const signals = keypressSignals('env')
    const { stdin, unmount } = render(<KeypressProbe signals={signals} />)

    stdin.write('\r')
    await settle()

    expect(signals.step.peek()).toBe('confirm')
    unmount()
  })

  it('when confirmed, saves the config and finishes', async () => {
    let saved = ''
    const signals = keypressSignals('confirm', (config) => {
      saved = config.crowConfigPath
    })
    const { stdin, unmount } = render(<KeypressProbe signals={signals} />)

    stdin.write('\r')
    await settle()

    expect(saved).toBe('.crow/config.json')
    expect(signals.step.peek()).toBe('done')
    unmount()
  })
})
