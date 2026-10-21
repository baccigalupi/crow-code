import { render } from 'ink'
import { signal } from '@preact/signals-core'
import { InstallApp } from '../../src/tui/install/views/install-app.tsx'
import type {
  InstallAppProps,
  InstallStep,
} from '../../src/tui/install/types.ts'
import { inputSignal } from './input-signal.ts'
import { mockTerminal } from './mock-terminal.ts'

export const mountInstallApp = (
  rows = 8,
  props: Partial<InstallAppProps> = {},
) => {
  const terminal = mockTerminal({ rows })
  const instance = render(
    <InstallApp
      repoDirectory={inputSignal('')}
      globalDirectory={inputSignal('')}
      envFile={inputSignal('')}
      escalateRead={inputSignal('')}
      escalateWrite={inputSignal('')}
      step={signal<InstallStep>('repo')}
      {...props}
    />,
    { ...terminal.io, debug: true, exitOnCtrlC: false },
  )
  return { terminal, instance }
}
