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

  it('inserts pasted text into the input', async () => {
    const lines = new Signal<string[]>([])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.paste('hello world')
    await harness.pilot.press('return')

    expect(lines.peek()).toEqual(['hello world'])
    harness.destroy()
  })

  it('flattens line breaks when pasting into the input', async () => {
    const lines = new Signal<string[]>([])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.paste('a\nb')
    await harness.pilot.press('return')

    expect(lines.peek()).toEqual(['a b'])
    harness.destroy()
  })

  it('copies a drag selection from the chat to the clipboard', async () => {
    const lines = new Signal<string[]>(['hello', 'world'])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.drag(0, 3, 4, 3)

    expect(harness.stdout.text).toContain('\x1b]52;c;aGVsbG8=\x07')
    harness.destroy()
  })

  it('copies a multi-row drag selection from the chat', async () => {
    const lines = new Signal<string[]>(['hello', 'world'])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.drag(0, 3, 5, 4)

    expect(harness.stdout.text).toContain('\x1b]52;c;aGVsbG8Kd29ybGQ=\x07')
    harness.destroy()
  })

  it('copies a backwards drag selection from the chat', async () => {
    const lines = new Signal<string[]>(['hello', 'world'])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.drag(4, 3, 0, 3)

    expect(harness.stdout.text).toContain('\x1b]52;c;aGVsbG8=\x07')
    harness.destroy()
  })

  it('copies a backwards multi-row drag selection from the chat', async () => {
    const lines = new Signal<string[]>(['hello', 'world'])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.drag(0, 4, 4, 3)

    expect(harness.stdout.text).toContain('\x1b]52;c;bwp3\x07')
    harness.destroy()
  })

  it('does not copy when a drag starts outside the chat', async () => {
    const lines = new Signal<string[]>(['hello', 'world'])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.drag(0, 0, 4, 4)

    expect(harness.stdout.text).not.toContain(']52;')
    harness.destroy()
  })

  it('does not write to the clipboard on a click without a drag', async () => {
    const lines = new Signal<string[]>(['hello', 'world'])
    const harness = await createTestTerminalApp(
      new ReplOptions(lines, () => {}),
    )

    await harness.pilot.click(2, 3)

    expect(harness.stdout.text).not.toContain(']52;')
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
