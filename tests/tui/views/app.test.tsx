import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { render as inkRender } from 'ink'
import { App } from '../../../src/tui/views/app.tsx'
import { ChatSession } from '../../../src/tui/interactions/state/chat-session.ts'
import { mockTerminal } from '../../support/mock-terminal.ts'

describe('App', () => {
  it('when text is typed, the frame shows it', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('hello')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('hello')

    unmount()
  })

  it('when enter is pressed, the entry moves to history and input clears', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('hi')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('hi')
    expect(lastFrame()).toContain('type a message')

    unmount()
  })

  it('when enter is pressed on empty input, a blank entry is kept', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('after')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('after')

    unmount()
  })

  it('when ctrl+j arrives, a newline is inserted', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('a')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('\n')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('b')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toMatch(/a[^\n]*\n[^\n]*b/)

    unmount()
  })

  it('when option+enter arrives, a newline is inserted', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('a')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('\x1b\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('b')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toMatch(/a[^\n]*\n[^\n]*b/)

    unmount()
  })

  it('when shift+enter arrives via kitty protocol, a newline is inserted', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('a')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('\x1b[13;2u')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('b')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toMatch(/a[^\n]*\n[^\n]*b/)

    unmount()
  })

  it('when backspace arrives, the previous char is deleted', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('ab')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('\x7f')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('a')
    expect(lastFrame()).not.toContain('ab')

    unmount()
  })

  it('when left arrow then typing, inserts before the cursor', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('ac')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('\x1b[D')
    await new Promise((resolve) => setTimeout(resolve, 0))
    stdin.write('b')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('abc')

    unmount()
  })

  it('when mounted, the header renders', async () => {
    const { lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('Crow Code - context is King')
    expect(lastFrame()).toContain('ctrl-c quit')

    unmount()
  })

  it('when an unbound modified key arrives, nothing changes', async () => {
    const { stdin, lastFrame, unmount } = render(
      <App session={new ChatSession(80)} />,
    )

    stdin.write('\x18')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toContain('type a message')

    unmount()
  })

  it('when the terminal resizes, the input remeasures', async () => {
    const terminal = mockTerminal({})
    const instance = inkRender(<App session={new ChatSession(80)} />, {
      ...terminal.io,
      debug: true,
      exitOnCtrlC: false,
    })

    terminal.stdin.write('x'.repeat(200))
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdout.columns = 400
    terminal.stdout.rows = 24
    terminal.stdout.emit('resize')
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(terminal.lastFrame()).toMatch(/x{200}/)

    instance.unmount()
  })

  it('when the terminal shrinks vertically, older history is hidden', async () => {
    const terminal = mockTerminal({})
    const instance = inkRender(<App session={new ChatSession(80)} />, {
      ...terminal.io,
      debug: true,
      exitOnCtrlC: false,
    })

    terminal.stdin.write('msg1')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('msg2')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('msg3')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('msg4')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('msg5')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('msg6')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\r')
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdout.columns = 80
    terminal.stdout.rows = 8
    terminal.stdout.emit('resize')
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(terminal.lastFrame()).not.toContain('msg1')
    expect(terminal.lastFrame()).not.toContain('msg2')
    expect(terminal.lastFrame()).toContain('msg3')
    expect(terminal.lastFrame()).toContain('msg6')
    expect(terminal.lastFrame()).toContain('type a message')

    instance.unmount()
  })

  it('when mounted, the frame fills the terminal height', async () => {
    const terminal = mockTerminal({ rows: 8 })
    const instance = inkRender(<App session={new ChatSession(80)} />, {
      ...terminal.io,
      debug: true,
      exitOnCtrlC: false,
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(terminal.lastFrame().split('\n')).toHaveLength(8)

    instance.unmount()
  })

  it('when stdout reports no columns, falls back to 80', async () => {
    const terminal = mockTerminal({})
    const instance = inkRender(<App session={new ChatSession(80)} />, {
      ...terminal.io,
      debug: true,
      exitOnCtrlC: false,
    })

    terminal.stdout.columns = 0
    terminal.stdout.rows = 24
    terminal.stdout.emit('resize')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(terminal.lastFrame()).toContain('Crow Code')

    instance.unmount()
  })

  it('when stdin is not a tty, mounts without input handling', async () => {
    const terminal = mockTerminal({ tty: false })
    const instance = inkRender(<App session={new ChatSession(80)} />, {
      ...terminal.io,
      debug: true,
      exitOnCtrlC: false,
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(terminal.lastFrame()).toContain('Crow Code - context is King')

    instance.unmount()
  })
})
