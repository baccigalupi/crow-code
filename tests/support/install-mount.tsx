import { render } from 'ink'
import { signal } from '@preact/signals-core'
import { InstallApp } from '../../src/tui/install/views/install-app.tsx'
import type { InstallStep, InstallStore } from '../../src/tui/install/types.ts'
import { inputSignal } from './input-signal.ts'
import { mockTerminal } from './mock-terminal.ts'

export const mountInstallApp = (
  rows = 8,
  state: Partial<InstallStore> = {},
) => {
  const terminal = mockTerminal({ rows })
  const installStore = {
    repoDirectory: inputSignal(''),
    globalDirectory: inputSignal(''),
    envFile: inputSignal(''),
    additionalRead: inputSignal(''),
    escalateRead: inputSignal(''),
    escalateWrite: inputSignal(''),
    allowedLocalScripts: inputSignal(''),
    step: signal<InstallStep>('repo'),
    confirmation: signal(true),
    ...state,
  }
  const instance = render(
    <InstallApp installStore={installStore} />,
    { ...terminal.io, debug: true, exitOnCtrlC: false },
  )
  return { terminal, instance }
}
