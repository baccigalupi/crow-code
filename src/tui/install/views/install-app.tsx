import { Box, useStdout } from 'ink'
import { useSignalValue } from '../../use-signal-value.ts'
import {
  installStep,
  repoDirectoryBuffer,
  userDirectoryBuffer,
} from '../interactions/state/directory-buffer.ts'
import { useInstallKeys } from '../interactions/hooks/use-install-keys.ts'
import { ConfigPanel } from './config.tsx'
import { RepoPrompt, UserPrompt } from './prompt.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = (
  {
    repo = repoDirectoryBuffer,
    user = userDirectoryBuffer,
    step = installStep,
  }: InstallAppProps,
) => {
  const { stdout } = useStdout()
  const repoDirectory = useSignalValue(repo)
  const userDirectory = useSignalValue(user)
  const currentStep = useSignalValue(step)
  useInstallKeys({ repo, user, step })

  return (
    <Box
      flexDirection='column'
      height={stdout.rows || 24}
      width={stdout.columns || 80}
    >
      <Header />
      <ConfigPanel
        step={currentStep}
        user={userDirectory}
        repo={repoDirectory}
      />
      <Box flexDirection='column' flexGrow={1} justifyContent='flex-end'>
        <RepoPrompt step={currentStep} buffer={repoDirectory} />
        <UserPrompt step={currentStep} buffer={userDirectory} />
      </Box>
    </Box>
  )
}
