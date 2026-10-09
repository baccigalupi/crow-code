import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { render as inkRender } from 'ink'
import { signal } from '@preact/signals-core'
import { InstallApp } from '../../../../src/tui/install/views/install-app.tsx'
import {
  installStep,
  repoDirectoryBuffer,
  userDirectoryBuffer,
} from '../../../../src/tui/install/interactions/state/directory-buffer.ts'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'
import { mockTerminal } from '../../../support/mock-terminal.ts'

const buffer = (text: string) => signal(insertText(emptyBuffer(), text))

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

const mountDebug = (rows = 8) => {
  const terminal = mockTerminal({ rows })
  const instance = inkRender(
    <InstallApp
      repo={buffer('')}
      user={buffer('')}
      step={signal<'repo' | 'user'>('repo')}
    />,
    { ...terminal.io, debug: true, exitOnCtrlC: false },
  )
  return { terminal, instance }
}

describe('InstallApp', () => {
  it('when mounted, renders the header and the repo directory question', async () => {
    const { lastFrame, unmount } = render(
      <InstallApp
        repo={buffer('')}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()

    expect(lastFrame()).toContain('Installing Crow Code')
    expect(lastFrame()).toContain('ctrl-c quit')
    expect(lastFrame()).toContain(
      'What directory for the local repo crow setup: (./crow)',
    )
    expect(lastFrame()).not.toContain('config.json')
    expect(lastFrame()).not.toContain('userDirectory')

    unmount()
  })

  it('when text is typed, it becomes the repo directory', async () => {
    const repo = buffer('')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()
    stdin.write('./crow2')
    await settle()

    expect(repo.peek().text).toBe('./crow2')

    unmount()
  })

  it('when backspace arrives, the previous char is deleted', async () => {
    const repo = buffer('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()
    stdin.write('\x7f')
    await settle()

    expect(repo.peek().text).toBe('~/')

    unmount()
  })

  it('when delete arrives, the char under the cursor is removed', async () => {
    const repo = buffer('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()
    stdin.write('\x1b[H\x1b[3~')
    await settle()

    expect(repo.peek().text).toBe('/x')

    unmount()
  })

  it('when home and end arrive, the cursor moves to the line edges', async () => {
    const repo = buffer('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()
    stdin.write('\x1b[H')
    await settle()
    stdin.write('\x1b[F')
    await settle()
    stdin.write('\x1b[C')
    await settle()

    expect(repo.peek().cursor).toBe('~/x'.length)

    unmount()
  })

  it('when a ctrl-modified key has no binding, nothing changes', async () => {
    const repo = buffer('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()
    stdin.write('\x18')
    await settle()

    expect(repo.peek().text).toBe('~/x')

    unmount()
  })

  it('when arrows arrive, the cursor moves', async () => {
    const repo = buffer('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()
    stdin.write('\x1b[D\x1b[D')
    await settle()
    stdin.write('X')
    await settle()

    expect(repo.peek().text).toBe('~X/x')

    unmount()
  })

  it('when the repo question is answered, the config and user question show', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const { stdin, lastFrame, unmount } = render(
      <InstallApp repo={buffer('./lib')} user={buffer('')} step={step} />,
    )

    await settle()
    stdin.write('\r')
    await settle()

    expect(lastFrame()).toContain('./lib/config.json')
    expect(lastFrame()).toContain('"userDirectory": "~/.crow"')
    expect(lastFrame()).toContain('User crow directory: (~/.crow)')
    expect(lastFrame()).not.toContain('local repo crow setup')

    unmount()
  })

  it('when the user directory is typed, the config updates', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const user = buffer('')
    const { stdin, lastFrame, unmount } = render(
      <InstallApp repo={buffer('')} user={user} step={step} />,
    )

    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('/opt/crow')
    await settle()

    expect(lastFrame()).toContain('"userDirectory": "/opt/crow"')
    expect(user.peek().text).toBe('/opt/crow')

    unmount()
  })

  it('when the user question is answered, the app exits', async () => {
    const { terminal, instance } = mountDebug()

    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')

    await instance.waitUntilExit()
  })

  it('when escape is pressed, the app exits', async () => {
    const { terminal, instance } = mountDebug()

    await settle()
    terminal.stdin.write('\x1b')

    await instance.waitUntilExit()
  })

  it('when ctrl-c arrives, the app exits', async () => {
    const { terminal, instance } = mountDebug()

    await settle()
    terminal.stdin.write('\x03')

    await instance.waitUntilExit()
  })

  it('when stdin is not a tty, mounts without input handling', async () => {
    const terminal = mockTerminal({ tty: false })
    const instance = inkRender(
      <InstallApp
        repo={buffer('')}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
      { ...terminal.io, debug: true, exitOnCtrlC: false },
    )

    await settle()

    expect(terminal.lastFrame()).toContain('Installing Crow Code')

    instance.unmount()
  })

  it('when mounted, the frame fills the terminal height', async () => {
    const { terminal, instance } = mountDebug()

    await settle()

    expect(terminal.lastFrame().split('\n')).toHaveLength(8)

    instance.unmount()
  })

  it('when stdout reports no columns, falls back to 80', async () => {
    const terminal = mockTerminal({ columns: 0 })
    const instance = inkRender(
      <InstallApp
        repo={buffer('')}
        user={buffer('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
      { ...terminal.io, debug: true, exitOnCtrlC: false },
    )

    await settle()

    expect(terminal.lastFrame()).toContain('Installing Crow Code')

    instance.unmount()
  })

  it('when mounted, the prompt sits at the bottom of the terminal', async () => {
    const { terminal, instance } = mountDebug()

    await settle()

    const lines = terminal.lastFrame().split('\n')
    expect(lines[7]).toContain('What directory for the local repo crow setup:')
    expect(lines[7]).toContain('(./crow)')

    instance.unmount()
  })

  it('when no props are given, uses the shared signals', async () => {
    repoDirectoryBuffer.value = emptyBuffer()
    userDirectoryBuffer.value = emptyBuffer()
    installStep.value = 'repo'
    const { lastFrame, unmount } = render(<InstallApp />)

    await settle()

    expect(lastFrame()).toContain('(./crow)')

    unmount()
  })
})
