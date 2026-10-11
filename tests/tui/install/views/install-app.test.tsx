import { describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { render as inkRender } from 'ink'
import { signal } from '@preact/signals-core'
import { InstallApp } from '../../../../src/tui/install/views/install-app.tsx'
import {
  installStep,
  repoDirectoryInput,
  userDirectoryInput,
} from '../../../../src/tui/install/interactions/state/config-buffer.ts'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import { inputSignal } from '../../../support/input-signal.ts'
import { mountInstallApp } from '../../../support/install-mount.tsx'
import { settle } from '../../../support/settle.ts'
import { mockTerminal } from '../../../support/mock-terminal.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('InstallApp', () => {
  it('when mounted, renders the header and the repo directory question', async () => {
    const { lastFrame, unmount } = render(
      <InstallApp
        repo={inputSignal('')}
        user={inputSignal('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
    )

    await settle()

    expect(lastFrame()).toContain('Installing Crow Code')
    expect(lastFrame()).toContain('ctrl-c quit')
    expect(lastFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    expect(lastFrame()).not.toContain('config.json')
    expect(lastFrame()).not.toContain('userDirectory')
    unmount()
  })

  it('when text is typed, it becomes the repo directory', async () => {
    const repo = inputSignal('')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={inputSignal('')}
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
    const repo = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={inputSignal('')}
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
    const repo = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={inputSignal('')}
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
    const repo = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={inputSignal('')}
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
    const repo = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={inputSignal('')}
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
    const repo = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repo={repo}
        user={inputSignal('')}
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
      <InstallApp
        repo={inputSignal('./lib')}
        user={inputSignal('')}
        step={step}
      />,
    )

    await settle()
    stdin.write('\r')
    await settle()

    expect(lastFrame()).toContain('./lib/config.json')
    expect(lastFrame()).toContain('"userDirectory": "~/.crow"')
    expect(lastFrame()).toContain('"permissions"')
    expect(lastFrame()).toContain('"ignore"')
    expect(lastFrame()).toContain('"node_modules"')
    expect(lastFrame()).toContain('".git"')
    expect(lastFrame()).toContain('"additionalRead": []')
    expect(lastFrame()).toContain('"additionalWrite": []')
    expect(lastFrame()).toContain('User crow directory: (~/.crow)')
    expect(lastFrame()).not.toContain('local repo crow setup')
    unmount()
  })

  it('when the user directory is typed, the config updates', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const user = inputSignal('')
    const { stdin, lastFrame, unmount } = render(
      <InstallApp repo={inputSignal('')} user={user} step={step} />,
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

  it('when the user question is answered, a write confirmation prompt shows', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const { stdin, lastFrame, unmount } = render(
      <InstallApp
        repo={inputSignal('./lib')}
        user={inputSignal('')}
        step={step}
      />,
    )

    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('\r')
    await settle()

    expect(lastFrame()).toContain('Write config to ./lib/config.json?')
    expect(lastFrame()).toContain('Yes')
    expect(lastFrame()).toContain('No')
    unmount()
  })

  it('when right arrow arrives on the confirm step, the choice becomes no', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const confirmation = signal(true)
    const { stdin, unmount } = render(
      <InstallApp
        repo={inputSignal('')}
        user={inputSignal('')}
        step={step}
        confirmation={confirmation}
      />,
    )

    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('\x1b[C')
    await settle()

    expect(confirmation.peek()).toBe(false)
    unmount()
  })

  it('when left arrow arrives on the confirm step, the choice becomes yes', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const confirmation = signal(false)
    const { stdin, unmount } = render(
      <InstallApp
        repo={inputSignal('')}
        user={inputSignal('')}
        step={step}
        confirmation={confirmation}
      />,
    )

    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('\x1b[C')
    await settle()
    stdin.write('\x1b[D')
    await settle()

    expect(confirmation.peek()).toBe(true)
    unmount()
  })

  it('when n arrives on the confirm step, the choice becomes no', async () => {
    const step = signal<'repo' | 'user'>('repo')
    const confirmation = signal(true)
    const { stdin, unmount } = render(
      <InstallApp
        repo={inputSignal('')}
        user={inputSignal('')}
        step={step}
        confirmation={confirmation}
      />,
    )

    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('\r')
    await settle()
    stdin.write('n')
    await settle()

    expect(confirmation.peek()).toBe(false)
    unmount()
  })

  it('when yes is confirmed, the config is saved and a written message shows', async () => {
    const saved: unknown[] = []
    const { terminal, instance } = mountInstallApp(24, {
      save: (config: unknown) => saved.push(config),
    })

    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')
    await settle()

    expect(saved).toHaveLength(1)
    const config = saved[0] as { filePath: string; json: string }
    expect(config.filePath).toBe('.crow/config.json')
    expect(config.json).toContain('"permissions"')
    expect(terminal.lastFrame()).toContain(
      'Wrote config to .crow/config.json',
    )
    terminal.stdin.write('x')
    await instance.waitUntilExit()
  })

  it('when the save prop is omitted, yes writes the config file', async () => {
    const repoDirectory = join(fixturesDirectory, 'install-app', 'crow')
    await clearDirectory(repoDirectory)
    const { terminal, instance } = mountInstallApp(8, {
      repo: inputSignal(repoDirectory),
    })

    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')
    await settle()

    const written = JSON.parse(
      Deno.readTextFileSync(join(repoDirectory, 'config.json')),
    )
    expect(written.userDirectory).toBe('~/.crow')
    expect(written.permissions.ignore).toEqual(['node_modules', '.git'])
    expect(written.permissions.additionalRead).toEqual([])
    expect(written.permissions.additionalWrite).toEqual([])
    terminal.stdin.write('x')
    await instance.waitUntilExit()
    await clearDirectory(repoDirectory)
  })

  it('when no is confirmed, the app exits without saving', async () => {
    const saved: unknown[] = []
    const { terminal, instance } = mountInstallApp(8, {
      save: (config: unknown) => saved.push(config),
    })

    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\x1b[C')
    await settle()
    terminal.stdin.write('\r')
    await instance.waitUntilExit()

    expect(saved).toHaveLength(0)
  })

  it('when escape is pressed on the confirm step, nothing is saved', async () => {
    const saved: unknown[] = []
    const { terminal, instance } = mountInstallApp(8, {
      save: (config: unknown) => saved.push(config),
    })

    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\r')
    await settle()
    terminal.stdin.write('\x1b')
    await instance.waitUntilExit()

    expect(saved).toHaveLength(0)
  })

  it('when escape is pressed, the app exits', async () => {
    const { terminal, instance } = mountInstallApp()

    await settle()
    terminal.stdin.write('\x1b')

    await instance.waitUntilExit()
  })

  it('when ctrl-c arrives, the app exits', async () => {
    const { terminal, instance } = mountInstallApp()

    await settle()
    terminal.stdin.write('\x03')

    await instance.waitUntilExit()
  })

  it('when stdin is not a tty, mounts without input handling', async () => {
    const terminal = mockTerminal({ tty: false })
    const instance = inkRender(
      <InstallApp
        repo={inputSignal('')}
        user={inputSignal('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
      { ...terminal.io, debug: true, exitOnCtrlC: false },
    )

    await settle()

    expect(terminal.lastFrame()).toContain('Installing Crow Code')
    instance.unmount()
  })

  it('when mounted, the frame fills the terminal height', async () => {
    const { terminal, instance } = mountInstallApp()

    await settle()

    expect(terminal.lastFrame().split('\n')).toHaveLength(8)
    instance.unmount()
  })

  it('when stdout reports no columns, falls back to 80', async () => {
    const terminal = mockTerminal({ columns: 0 })
    const instance = inkRender(
      <InstallApp
        repo={inputSignal('')}
        user={inputSignal('')}
        step={signal<'repo' | 'user'>('repo')}
      />,
      { ...terminal.io, debug: true, exitOnCtrlC: false },
    )

    await settle()

    expect(terminal.lastFrame()).toContain('Installing Crow Code')
    instance.unmount()
  })

  it('when mounted, the prompt sits at the bottom of the terminal', async () => {
    const { terminal, instance } = mountInstallApp()

    await settle()

    const lines = terminal.lastFrame().split('\n')
    expect(lines[7]).toContain('What directory for the local repo crow setup:')
    expect(lines[7]).toContain('(.crow)')
    instance.unmount()
  })

  it('when no props are given, uses the shared signals', async () => {
    repoDirectoryInput.value = emptyBuffer()
    userDirectoryInput.value = emptyBuffer()
    installStep.value = 'repo'
    const { lastFrame, unmount } = render(<InstallApp />)

    await settle()

    expect(lastFrame()).toContain('(.crow)')
    unmount()
  })
})
