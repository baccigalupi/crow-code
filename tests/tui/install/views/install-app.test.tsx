import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { render as inkRender } from 'ink'
import { signal } from '@preact/signals-core'
import { InstallApp } from '../../../../src/tui/install/views/install-app.tsx'
import type { InstallStep } from '../../../../src/tui/install/types.ts'
import {
  crowGlobalDirectoryInput,
  crowRepoDirectoryInput,
  installStep,
} from '../../../../src/tui/install/interactions/state/config-buffer.ts'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import { inputSignal } from '../../../support/input-signal.ts'
import { mountInstallApp } from '../../../support/install-mount.tsx'
import { mockTerminal } from '../../../support/mock-terminal.ts'
import { stripAnsi } from '../../../support/strip-ansi.ts'

describe('InstallApp', () => {
  it('when mounted, renders the header and the repo directory question', () => {
    const repoDirectory = inputSignal('')
    const globalDirectory = inputSignal('')
    const step = signal<InstallStep>('repo')

    const { lastFrame, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        step={step}
      />,
    )

    expect(stripAnsi(lastFrame())).toContain('Installing Crow Code')
    expect(stripAnsi(lastFrame())).toContain('ctrl-c quit')
    expect(stripAnsi(lastFrame())).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    expect(stripAnsi(lastFrame())).not.toContain('config.json')
    expect(stripAnsi(lastFrame())).not.toContain('crowGlobalDirectory')
    unmount()
  })

  it('when text is typed, it becomes the repo directory', () => {
    const repoDirectory = inputSignal('')
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
      />,
    )

    stdin.write('./crow2')

    expect(repoDirectory.peek().text).toBe('./crow2')
    unmount()
  })

  it('when backspace arrives, the previous char is deleted', () => {
    const repoDirectory = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
      />,
    )

    stdin.write('\x7f')

    expect(repoDirectory.peek().text).toBe('~/')
    unmount()
  })

  it('when delete arrives, the char under the cursor is removed', () => {
    const repoDirectory = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
      />,
    )

    stdin.write('\x1b[H\x1b[3~')

    expect(repoDirectory.peek().text).toBe('/x')
    unmount()
  })

  it('when home and end arrive, the cursor moves to the line edges', () => {
    const repoDirectory = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
      />,
    )

    stdin.write('\x1b[H')
    stdin.write('\x1b[F')
    stdin.write('\x1b[C')

    expect(repoDirectory.peek().cursor).toBe('~/x'.length)
    unmount()
  })

  it('when a ctrl-modified key has no binding, nothing changes', () => {
    const repoDirectory = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
      />,
    )

    stdin.write('\x18')

    expect(repoDirectory.peek().text).toBe('~/x')
    unmount()
  })

  it('when arrows arrive, the cursor moves', () => {
    const repoDirectory = inputSignal('~/x')
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
      />,
    )

    stdin.write('\x1b[D\x1b[D')
    stdin.write('X')

    expect(repoDirectory.peek().text).toBe('~X/x')
    unmount()
  })

  it('when the repo question is answered, the config and user question show', async () => {
    const repoDirectory = inputSignal('./lib')
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(24, { repoDirectory, step })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain('./lib/config.json')
    expect(stripAnsi(terminal.lastFrame())).toContain(
      '"crowGlobalDirectory": "~/.crow"',
    )
    expect(stripAnsi(terminal.lastFrame())).toContain('"permissions"')
    expect(stripAnsi(terminal.lastFrame())).toContain('"ignore": []')
    expect(stripAnsi(terminal.lastFrame())).toContain('"additionalRead": []')
    expect(stripAnsi(terminal.lastFrame())).toContain('"additionalWrite": []')
    expect(stripAnsi(terminal.lastFrame())).toContain(
      'User crow directory: (~/.crow)',
    )
    expect(stripAnsi(terminal.lastFrame())).not.toContain(
      'local repo crow setup',
    )
    instance.unmount()
  })

  it('when the user directory is typed, the config updates', async () => {
    const globalDirectory = inputSignal('')
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(24, {
      globalDirectory,
      step,
    })

    terminal.stdin.write('\r')
    terminal.stdin.write('/opt/crow')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      '"crowGlobalDirectory": "/opt/crow"',
    )
    expect(globalDirectory.peek().text).toBe('/opt/crow')
    instance.unmount()
  })

  it('when the user question is answered, a write confirmation prompt shows', async () => {
    const repoDirectory = inputSignal('./lib')
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(24, { repoDirectory, step })

    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Write config to ./lib/config.json?',
    )
    expect(stripAnsi(terminal.lastFrame())).toContain('Yes')
    expect(stripAnsi(terminal.lastFrame())).toContain('No')
    instance.unmount()
  })

  it('when the user question is answered, the env file question shows', async () => {
    const step = signal<InstallStep>('crowGlobalDirectory')
    const { terminal, instance } = mountInstallApp(24, { step })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Credentials .env file: (~/.crow/.env)',
    )
    expect(stripAnsi(terminal.lastFrame())).not.toContain(
      'User crow directory',
    )
    instance.unmount()
  })

  it('when the user directory is custom, the env file question defaults inside it', async () => {
    const globalDirectory = inputSignal('/opt/crow')
    const step = signal<InstallStep>('crowGlobalDirectory')
    const { terminal, instance } = mountInstallApp(24, {
      globalDirectory,
      step,
    })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Credentials .env file: (/opt/crow/.env)',
    )
    instance.unmount()
  })

  it('when the env file is typed, the config updates', async () => {
    const envFile = inputSignal('')
    const step = signal<InstallStep>('envFile')
    const { terminal, instance } = mountInstallApp(24, { envFile, step })

    terminal.stdin.write('/secrets/crow.env')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      '"envFile": "/secrets/crow.env"',
    )
    expect(envFile.peek().text).toBe('/secrets/crow.env')
    instance.unmount()
  })

  it('when the env file question is answered, the escalate read question shows', async () => {
    const step = signal<InstallStep>('envFile')
    const { terminal, instance } = mountInstallApp(24, { step })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Escalate read directories: (none)',
    )
    instance.unmount()
  })

  it('when the escalate read question is answered, the escalate write question shows', async () => {
    const step = signal<InstallStep>('escalateRead')
    const { terminal, instance } = mountInstallApp(24, { step })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Escalate write directories: (./dev, ./agent)',
    )
    instance.unmount()
  })

  it('when escalate read directories are typed, the config updates', async () => {
    const escalateRead = inputSignal('')
    const step = signal<InstallStep>('escalateRead')
    const { terminal, instance } = mountInstallApp(24, { escalateRead, step })

    terminal.stdin.write('/docs')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain('"/docs"')
    expect(escalateRead.peek().text).toBe('/docs')
    instance.unmount()
  })

  it('when the escalate write question is answered, the allowed local scripts question shows', async () => {
    const step = signal<InstallStep>('escalateWrite')
    const { terminal, instance } = mountInstallApp(24, { step })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain('Allowed local scripts')
    instance.unmount()
  })

  it('when allowed local scripts are typed, the config updates', async () => {
    const allowedLocalScripts = inputSignal('')
    const step = signal<InstallStep>('allowedLocalScripts')
    const { terminal, instance } = mountInstallApp(24, {
      allowedLocalScripts,
      step,
    })

    terminal.stdin.write('./build.sh')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain('"./build.sh"')
    expect(allowedLocalScripts.peek().text).toBe('./build.sh')
    instance.unmount()
  })

  it('when the allowed local scripts question is answered, the write confirmation shows', async () => {
    const step = signal<InstallStep>('allowedLocalScripts')
    const { terminal, instance } = mountInstallApp(24, { step })

    terminal.stdin.write('\r')
    await instance.waitUntilRenderFlush()

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Write config to .crow/config.json?',
    )
    instance.unmount()
  })

  it('when right arrow arrives on the confirm step, the choice becomes no', () => {
    const confirmation = signal(true)
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={inputSignal('')}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
        confirmation={confirmation}
      />,
    )

    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\x1b[C')

    expect(confirmation.peek()).toBe(false)
    unmount()
  })

  it('when left arrow arrives on the confirm step, the choice becomes yes', () => {
    const confirmation = signal(false)
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={inputSignal('')}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
        confirmation={confirmation}
      />,
    )

    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\x1b[C')
    stdin.write('\x1b[D')

    expect(confirmation.peek()).toBe(true)
    unmount()
  })

  it('when n arrives on the confirm step, the choice becomes no', () => {
    const confirmation = signal(true)
    const { stdin, unmount } = render(
      <InstallApp
        repoDirectory={inputSignal('')}
        globalDirectory={inputSignal('')}
        step={signal<InstallStep>('repo')}
        confirmation={confirmation}
      />,
    )

    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('\r')
    stdin.write('n')

    expect(confirmation.peek()).toBe(false)
    unmount()
  })

  it('when yes is confirmed, moves to the write step', () => {
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(24, { step })

    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')

    expect(step.peek()).toBe('write')
    instance.unmount()
  })

  it('when the step is done, a written message shows', async () => {
    const step = signal<InstallStep>('done')

    const { terminal, instance } = mountInstallApp(30, { step })

    expect(stripAnsi(terminal.lastFrame())).toContain(
      'Wrote config to .crow/config.json',
    )
    terminal.stdin.write('x')
    await instance.waitUntilExit()
  })

  it('when no is confirmed, the app exits without writing', async () => {
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(8, { step })

    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\x1b[C')
    terminal.stdin.write('\r')
    await instance.waitUntilExit()

    expect(step.peek()).toBe('confirm')
  })

  it('when escape is pressed on the confirm step, nothing is written', async () => {
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(8, { step })

    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\r')
    terminal.stdin.write('\x1b')
    await instance.waitUntilExit()

    expect(step.peek()).toBe('confirm')
  })

  it('when escape is pressed, the app exits', async () => {
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(8, { step })

    terminal.stdin.write('\x1b')

    await instance.waitUntilExit()
  })

  it('when ctrl-c arrives, the app exits', async () => {
    const step = signal<InstallStep>('repo')
    const { terminal, instance } = mountInstallApp(8, { step })

    terminal.stdin.write('\x03')

    await instance.waitUntilExit()
  })

  it('when stdin is not a tty, mounts without input handling', () => {
    const terminal = mockTerminal({ tty: false })
    const repoDirectory = inputSignal('')
    const globalDirectory = inputSignal('')
    const step = signal<InstallStep>('repo')

    const instance = inkRender(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        step={step}
      />,
      { ...terminal.io, debug: true, exitOnCtrlC: false },
    )

    expect(stripAnsi(terminal.lastFrame())).toContain('Installing Crow Code')
    instance.unmount()
  })

  it('when mounted, the frame fills the terminal height', () => {
    const step = signal<InstallStep>('repo')

    const { terminal, instance } = mountInstallApp(8, { step })

    expect(stripAnsi(terminal.lastFrame()).split('\n')).toHaveLength(8)
    instance.unmount()
  })

  it('when stdout reports no columns, falls back to 80', () => {
    const terminal = mockTerminal({ columns: 0 })
    const repoDirectory = inputSignal('')
    const globalDirectory = inputSignal('')
    const step = signal<InstallStep>('repo')

    const instance = inkRender(
      <InstallApp
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        step={step}
      />,
      { ...terminal.io, debug: true, exitOnCtrlC: false },
    )

    expect(stripAnsi(terminal.lastFrame())).toContain('Installing Crow Code')
    instance.unmount()
  })

  it('when mounted, the prompt sits at the bottom of the terminal', () => {
    const step = signal<InstallStep>('repo')

    const { terminal, instance } = mountInstallApp(8, { step })

    const lines = stripAnsi(terminal.lastFrame()).split('\n')
    expect(lines[7]).toContain('What directory for the local repo crow setup:')
    expect(lines[7]).toContain('(.crow)')
    instance.unmount()
  })

  it('when no props are given, uses the shared install data', () => {
    crowRepoDirectoryInput.value = emptyBuffer()
    crowGlobalDirectoryInput.value = emptyBuffer()
    installStep.value = 'repo'

    const { lastFrame, unmount } = render(<InstallApp />)

    expect(stripAnsi(lastFrame())).toContain('(.crow)')
    unmount()
  })
})
