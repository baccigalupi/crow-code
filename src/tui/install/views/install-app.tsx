import { Box, useStdout } from 'ink'
import { useSignalValue } from '../../use-signal-value.ts'
import {
  allowedLocalScriptsInput,
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
import { StepPrompts } from './step-prompts.tsx'
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
    allowedLocalScripts = allowedLocalScriptsInput,
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
  const allowedLocalScriptsText = useSignalValue(allowedLocalScripts)
  const stepName = useSignalValue(step)
  const confirmed = useSignalValue(confirmation)
  const { rowHeight, columnWidth } = installAppViewModel({ stdout })
  const { crowConfigPath } = configPathViewModel({
    repoDirectory: crowRepoDirectory,
    globalDirectory: crowGlobalDirectory,
    envFile: envFileText,
    escalateRead: escalateReadText,
    escalateWrite: escalateWriteText,
    allowedLocalScripts: allowedLocalScriptsText,
  })
  const installState = {
    repoDirectory,
    globalDirectory,
    envFile,
    escalateRead,
    escalateWrite,
    allowedLocalScripts,
    step,
    confirmation,
  }
  useKeypress(installState)

  return (
    <Box flexDirection='column' height={rowHeight} width={columnWidth}>
      <Header />
      <ConfigPanel
        step={stepName}
        globalDirectory={crowGlobalDirectory}
        repoDirectory={crowRepoDirectory}
        envFile={envFileText}
        escalateRead={escalateReadText}
        escalateWrite={escalateWriteText}
        allowedLocalScripts={allowedLocalScriptsText}
      />
      <StepPrompts
        installState={installState}
        values={{
          globalDirectory: crowGlobalDirectory,
          repoDirectory: crowRepoDirectory,
          envFile: envFileText,
          escalateRead: escalateReadText,
          escalateWrite: escalateWriteText,
          allowedLocalScripts: allowedLocalScriptsText,
          crowConfigPath,
          confirmation: confirmed,
        }}
      />
    </Box>
  )
}
