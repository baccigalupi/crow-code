import { Box, useStdout } from 'ink'
import { useSignalValue } from '../../use-signal-value.ts'
import {
  crowGlobalDirectoryInput,
  crowRepoDirectoryInput,
  envFileInput,
  escalateReadInput,
  escalateWriteInput,
  installStep,
  writeConfirmation,
} from '../interactions/state/config-buffer.ts'
import { installAppViewModel } from './install-app-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { EnvPrompt } from './steps/env-prompt.tsx'
import { RepoPathPrompt } from './steps/repo-path-prompt.tsx'
import { GlobalPathPrompt } from './steps/global-path-prompt.tsx'
import { EscalateReadPrompt } from './steps/escalate-read-prompt.tsx'
import { EscalateWritePrompt } from './steps/escalate-write-prompt.tsx'
import { ConfirmPrompt } from './steps/confirm-prompt.tsx'
import { DoneMessage } from './steps/done-message.tsx'
import { Header } from './header.tsx'
import { configPathViewModel } from './config-path-view-model.ts'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = (
  {
    repoDirectory = crowRepoDirectoryInput,
    globalDirectory = crowGlobalDirectoryInput,
    envFile = envFileInput,
    escalateRead = escalateReadInput,
    escalateWrite = escalateWriteInput,
    step = installStep,
    confirmation = writeConfirmation,
  }: InstallAppProps,
) => {
  const { stdout } = useStdout()
  const crowRepoDirectory = useSignalValue(repoDirectory)
  const crowGlobalDirectory = useSignalValue(globalDirectory)
  const envFileText = useSignalValue(envFile)
  const escalateReadText = useSignalValue(escalateRead)
  const escalateWriteText = useSignalValue(escalateWrite)
  const currentStep = useSignalValue(step)
  const confirmed = useSignalValue(confirmation)
  const { rowHeight, columnWidth } = installAppViewModel({ stdout })
  const { crowConfigPath } = configPathViewModel({
    repoDirectory: crowRepoDirectory,
    globalDirectory: crowGlobalDirectory,
    envFile: envFileText,
    escalateRead: escalateReadText,
    escalateWrite: escalateWriteText,
  })
  useKeypress({
    repoDirectory,
    globalDirectory,
    envFile,
    escalateRead,
    escalateWrite,
    step,
    confirmation,
  })

  return (
    <Box flexDirection='column' height={rowHeight} width={columnWidth}>
      <Header />
      <ConfigPanel
        step={currentStep}
        globalDirectory={crowGlobalDirectory}
        repoDirectory={crowRepoDirectory}
        envFile={envFileText}
        escalateRead={escalateReadText}
        escalateWrite={escalateWriteText}
      />
      <Box flexDirection='column' flexGrow={1} justifyContent='flex-end'>
        <RepoPathPrompt step={currentStep} input={crowRepoDirectory} />
        <GlobalPathPrompt step={currentStep} input={crowGlobalDirectory} />
        <EnvPrompt
          step={currentStep}
          globalDirectory={crowGlobalDirectory}
          envFile={envFileText}
        />
        <EscalateReadPrompt step={currentStep} input={escalateReadText} />
        <EscalateWritePrompt step={currentStep} input={escalateWriteText} />
        <ConfirmPrompt
          step={currentStep}
          crowConfigPath={crowConfigPath}
          confirmation={confirmed}
        />
        <DoneMessage step={currentStep} crowConfigPath={crowConfigPath} />
      </Box>
    </Box>
  )
}
