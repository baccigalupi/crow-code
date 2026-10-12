import { Box, useStdout } from 'ink'
import { useSignalValue } from '../../use-signal-value.ts'
import {
  crowGlobalDirectoryInput,
  crowRepoDirectoryInput,
  installStep,
  writeConfirmation,
} from '../interactions/state/config-buffer.ts'
import { writeInstallConfig } from '../install-config.ts'
import { installViewModel } from './install-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { ConfigPanel } from './config.tsx'
import { RepoPrompt, UserPrompt } from './prompt.tsx'
import { ConfirmPrompt, DoneMessage } from './confirm.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = (
  {
    repo = crowRepoDirectoryInput,
    user = crowGlobalDirectoryInput,
    step = installStep,
    confirmation = writeConfirmation,
    save = writeInstallConfig,
  }: InstallAppProps,
) => {
  const { stdout } = useStdout()
  const crowRepoDirectory = useSignalValue(repo)
  const crowGlobalDirectory = useSignalValue(user)
  const currentStep = useSignalValue(step)
  const confirmed = useSignalValue(confirmation)
  const { rowHeight, columnWidth } = installViewModel({ stdout })
  useKeypress({ repo, user, step, confirmation, save })

  return (
    <Box flexDirection='column' height={rowHeight} width={columnWidth}>
      <Header />
      <ConfigPanel
        step={currentStep}
        user={crowGlobalDirectory}
        repo={crowRepoDirectory}
      />
      <Box flexDirection='column' flexGrow={1} justifyContent='flex-end'>
        <RepoPrompt step={currentStep} input={crowRepoDirectory} />
        <UserPrompt step={currentStep} input={crowGlobalDirectory} />
        <ConfirmPrompt
          step={currentStep}
          repo={crowRepoDirectory}
          user={crowGlobalDirectory}
          confirmation={confirmed}
        />
        <DoneMessage
          step={currentStep}
          repo={crowRepoDirectory}
          user={crowGlobalDirectory}
        />
      </Box>
    </Box>
  )
}
