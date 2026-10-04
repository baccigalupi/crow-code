import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Signal } from '@ubernaut/exotui/app'
import { createTestTerminalApp } from '@ubernaut/exotui/testing'
import { ReplOptions } from '../../src/repl/repl.ts'

describe('ReplOptions', () => {
  it('echoes a submitted message into the log', async () => {
    const lines = new Signal<string[]>([])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.press('h')
    await harness.pilot.press('i')
    await harness.pilot.press('return')

    expect(lines.peek()).toEqual(['hi'])
    harness.destroy()
  })

  it('clears the input after a submitted message', async () => {
    const lines = new Signal<string[]>([])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.press('h')
    await harness.pilot.press('i')
    await harness.pilot.press('return')
    await harness.pilot.press('x')
    await harness.pilot.press('return')

    expect(lines.peek()).toEqual(['hi', 'x'])
    harness.destroy()
  })

  it('calls onQuit on a single ctrl-c keypress', async () => {
    let quits = 0
    const lines = new Signal<string[]>([])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => quits += 1),
    )

    await harness.pilot.press('c', { ctrl: true })

    expect(quits).toBe(1)
    harness.destroy()
  })

  it('calls onQuit when the quit command fires', async () => {
    let quits = 0
    const lines = new Signal<string[]>([])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => quits += 1),
    )

    await harness.pilot.executeCommand('app.quit')

    expect(quits).toBe(1)
    harness.destroy()
  })
})
