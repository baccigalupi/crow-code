import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { logHistoryEntries } from '@ismail-elkorchi/terminal-ui/behavior'
import {
  createTerminalHarness,
  keyInput,
  pasteInput,
  pointerInput,
  wheelInput,
} from '@ismail-elkorchi/terminal-ui/testing'
import { textDocumentText } from '@ismail-elkorchi/terminal-ui/text'
import { createTuiRuntime } from '@ismail-elkorchi/terminal-ui/tui'
import { createReplApp } from '../../src/repl/repl.ts'

describe('createReplApp', () => {
  it('when text is typed, stores it in the input document', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })

    expect(textDocumentText(runtime.state().input.document)).toBe('hi')
    await runtime.dispose()
  })

  it('when enter is pressed, appends the message to history and clears the input', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInputChunk({ data: 'x' })
    await runtime.handleInput(keyInput('enter'))

    const entries = logHistoryEntries(runtime.state().history)
    expect(entries.length).toBe(2)
    expect(entries[0].text).toBe('hi')
    expect(entries[1].text).toBe('x')
    expect(textDocumentText(runtime.state().input.document)).toBe('')
    await runtime.dispose()
  })

  it('when ctrl-c is pressed, exits with completed status', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInput(keyInput('c', { modifiers: { ctrl: true } }))

    expect(runtime.exit()).toMatchObject({ status: 'completed' })
    await runtime.dispose()
  })

  it('when shift+enter is pressed, inserts a newline in the input', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'a' })
    await runtime.handleInput(keyInput('enter', { modifiers: { shift: true } }))

    expect(textDocumentText(runtime.state().input.document)).toBe('a\n')
    await runtime.dispose()
  })

  it('when backspace is pressed, deletes the previous character', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })
    await runtime.handleInput(keyInput('backspace'))

    expect(textDocumentText(runtime.state().input.document)).toBe('h')
    await runtime.dispose()
  })

  it('when ctrl-j is pressed, inserts a newline in the input', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'a' })
    await runtime.handleInput(keyInput('j', { modifiers: { ctrl: true } }))

    expect(textDocumentText(runtime.state().input.document)).toBe('a\n')
    await runtime.dispose()
  })

  it('when text with CRLF is pasted, normalizes line endings and keeps line breaks', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInput(pasteInput('a\r\nb'))

    expect(textDocumentText(runtime.state().input.document)).toBe('a\nb')
    await runtime.dispose()
  })

  it('when input wraps past one row, the input region grows', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInput(pasteInput('x'.repeat(200)))

    expect(runtime.state().inputRows).toBeGreaterThan(1)
    await runtime.dispose()
  })

  it('when input exceeds the row cap, the input region stays capped', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInput(
      pasteInput('a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\no\np\nq\nr\ns\nt'),
    )

    expect(runtime.state().inputRows).toBe(8)
    await runtime.dispose()
  })

  it('when the terminal is resized, the input region is re-measured', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInput(pasteInput('x'.repeat(200)))
    await runtime.resize({ columns: 400, rows: 24 })

    expect(runtime.state().inputRows).toBe(1)
    await runtime.dispose()
  })

  it('when the wheel scrolls over the input, the document scrolls', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInput(
      pasteInput('a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\no\np\nq\nr\ns\nt'),
    )
    await runtime.handleInput(
      wheelInput({ row: 20, column: 5, deltaRows: 1 }),
    )
    await runtime.flushInput()

    expect(runtime.state().input.scroll.offsetRow).toBeGreaterThan(0)
    await runtime.dispose()
  })

  it('when the wheel scrolls up in the chat, tail following stops', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'a' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInput(wheelInput({ row: 5, column: 5, deltaRows: -1 }))
    await runtime.flushInput()

    expect(runtime.state().chat.scroll.followTail).toBe(false)
    await runtime.dispose()
  })

  it('when a message is submitted after scrolling, tail following resumes', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'a' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInput(wheelInput({ row: 5, column: 5, deltaRows: -1 }))
    await runtime.flushInput()
    await runtime.handleInputChunk({ data: 'b' })
    await runtime.handleInput(keyInput('enter'))

    expect(runtime.state().chat.scroll.followTail).toBe(true)
    await runtime.dispose()
  })

  it('when a row is drag-selected in the chat, copies it with OSC52', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hello' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInput(
      pointerInput({ action: 'press', row: 4, column: 1 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'drag', row: 4, column: 6 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'release', row: 4, column: 6 }),
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(harness.output()).toContain('\x1b]52;c;aGVsbG8=\x07')
    await runtime.dispose()
  })

  it('when multiple rows are drag-selected, copies them joined by newlines', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInputChunk({ data: 'yo' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInput(
      pointerInput({ action: 'press', row: 4, column: 1 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'drag', row: 5, column: 3 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'release', row: 5, column: 3 }),
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(harness.output()).toContain('\x1b]52;c;aGkKeW8=\x07')
    await runtime.dispose()
  })

  it('when a drag starts outside the chat, nothing is copied', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInput(
      pointerInput({ action: 'press', row: 2, column: 1 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'drag', row: 5, column: 5 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'release', row: 5, column: 5 }),
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(harness.output()).not.toContain(']52;')
    await runtime.dispose()
  })

  it('when the chat is clicked without dragging, nothing is copied', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.handleInput(
      pointerInput({ action: 'press', row: 4, column: 1 }),
    )
    await runtime.handleInput(
      pointerInput({ action: 'release', row: 4, column: 1 }),
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(harness.output()).not.toContain(']52;')
    await runtime.dispose()
  })

  it('when a selection ends with an empty range, nothing is copied', async () => {
    const harness = createTerminalHarness({
      terminalSize: { columns: 80, rows: 24 },
    })
    const runtime = createTuiRuntime({
      app: createReplApp(),
      host: harness.host,
    })
    await runtime.start()

    await runtime.handleInputChunk({ data: 'hi' })
    await runtime.handleInput(keyInput('enter'))
    await runtime.dispatch({
      kind: 'chatTransition',
      transition: {
        kind: 'pointer',
        transition: {
          kind: 'endSelection',
          anchor: { entryId: 'entry-0', offset: 1 },
          position: { entryId: 'entry-0', offset: 1 },
        },
      },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(harness.output()).not.toContain(']52;')
    await runtime.dispose()
  })
})
