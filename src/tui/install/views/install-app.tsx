import { Box, useStdout } from 'ink'
import { useSignalValue } from '../../use-signal-value.ts'
import {
  crowGlobalDirectoryInput,
  crowRepoDirectoryInput,
  envFileInput,
  installStep,
  writeConfirmation,
} from '../interactions/state/config-buffer.ts'
import { writeCrowConfig } from '../crow-config/write.ts'
import { installAppViewModel } from './install-app-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { EnvPrompt } from './steps/env-prompt.tsx'
import { RepoPathPrompt } from './steps/repo-path-prompt.tsx'
import { GlobalPathPrompt } from './steps/global-path-prompt.tsx'
import { ConfirmPrompt } from './steps/confirm-prompt.tsx'
import { DoneMessage } from './steps/done-message.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = (
  {
    repoDirectory = crowRepoDirectoryInput,
    globalDirectory = crowGlobalDirectoryInput,
    envFile = envFileInput,
    step = installStep,
    confirmation = writeConfirmation,
    save = writeCrowConfig,
  }: InstallAppProps,
) => {
  const { stdout } = useStdout()
  const crowRepoDirectory = useSignalValue(repoDirectory)
  const crowGlobalDirectory = useSignalValue(globalDirectory)
  const envFileText = useSignalValue(envFile)
  const currentStep = useSignalValue(step)
  const confirmed = useSignalValue(confirmation)
  const { rowHeight, columnWidth } = installAppViewModel({ stdout })
  useKeypress({
    repoDirectory,
    globalDirectory,
    envFile,
    step,
    confirmation,
    save,
  })

  return (
    <Box flexDirection='column' height={rowHeight} width={columnWidth}>
      <Header />
      <ConfigPanel
        step={currentStep}
        globalDirectory={crowGlobalDirectory}
        repoDirectory={crowRepoDirectory}
        envFile={envFileText}
      />
      <Box flexDirection='column' flexGrow={1} justifyContent='flex-end'>
        <RepoPathPrompt step={currentStep} input={crowRepoDirectory} />
        <GlobalPathPrompt step={currentStep} input={crowGlobalDirectory} />
        <EnvPrompt
          step={currentStep}
          globalDirectory={crowGlobalDirectory}
          envFile={envFileText}
        />
        <ConfirmPrompt
          step={currentStep}
          repoDirectory={crowRepoDirectory}
          globalDirectory={crowGlobalDirectory}
          envFile={envFileText}
          confirmation={confirmed}
        />
        <DoneMessage
          step={currentStep}
          repoDirectory={crowRepoDirectory}
          globalDirectory={crowGlobalDirectory}
          envFile={envFileText}
        />
      </Box>
    </Box>
  )
}
