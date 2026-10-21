import { render } from 'ink'
import { signal } from '@preact/signals-core'
import { InstallApp } from '../../src/tui/install/views/install-app.tsx'
import type { InstallState, InstallStep } from '../../src/tui/install/types.ts'
import { inputSignal } from './input-signal.ts'
import { mockTerminal } from './mock-terminal.ts'

export const mountInstallApp = (
  rows = 8,
  state: Partial<InstallState> = {},
) => {
  const terminal = mockTerminal({ rows })
  const installState = {
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
    <InstallApp installState={installState} />,
    { ...terminal.io, debug: true, exitOnCtrlC: false },
  )
  return { terminal, instance }
}
