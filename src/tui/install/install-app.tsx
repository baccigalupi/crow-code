import { Box, Text, useApp, useInput, useStdin, useStdout } from 'ink'
import type { Signal } from '@preact/signals-core'
import { useSignalValue } from '../use-signal-value.ts'
import {
  deleteBackward,
  deleteForward,
  insertText,
  moveCursor,
} from '../input-buffer.ts'
import { bufferViewModel } from '../buffer-view-model.ts'
import {
  defaultRepoDirectory,
  defaultUserDirectory,
  installStep,
  repoDirectoryBuffer,
  userDirectoryBuffer,
} from './directory-buffer.ts'
import { Header } from './header.tsx'
import type { InputBuffer, KeyFlags } from '../types.ts'

type InstallStep = 'repo' | 'user'

type InstallAppProps = {
  readonly repo?: Signal<InputBuffer>
  readonly user?: Signal<InputBuffer>
  readonly step?: Signal<InstallStep>
}

const isQuit = (input: string, key: KeyFlags) =>
  key.escape === true || (key.ctrl === true && input === 'c') ||
  input === '\x1b'

const isModified = (key: KeyFlags) => key.ctrl === true || key.meta === true

const edit = (
  input: string,
  key: KeyFlags,
  buffer: Signal<InputBuffer>,
) => {
  if (key.backspace === true) buffer.value = deleteBackward(buffer.peek())
  else if (key.delete === true) buffer.value = deleteForward(buffer.peek())
  else if (key.leftArrow === true) {
    buffer.value = moveCursor(buffer.peek(), 'left')
  } else if (key.rightArrow === true) {
    buffer.value = moveCursor(buffer.peek(), 'right')
  } else if (key.home === true) {
    buffer.value = moveCursor(buffer.peek(), 'home')
  } else if (key.end === true) buffer.value = moveCursor(buffer.peek(), 'end')
  else if (input.length > 0 && !isModified(key)) {
    buffer.value = insertText(buffer.peek(), input)
  }
}

const directory = (buffer: InputBuffer, fallback: string) =>
  buffer.text.length === 0 ? fallback : buffer.text

const Config = ({ user, repo }: {
  readonly user: InputBuffer
  readonly repo: InputBuffer
}) => {
  const userDirectory = directory(user, defaultUserDirectory)
  const lines = JSON.stringify({ userDirectory }, null, 2).split('\n')
  return (
    <Box flexDirection='column' paddingX={1}>
      <Text>
        Installing repo config in:{' '}
        {directory(repo, defaultRepoDirectory)}/config.json
      </Text>
      <Box
        flexDirection='column'
        alignSelf='flex-start'
        backgroundColor='#0a0f1e'
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        {lines.map((line) => <Text key={line}>{line}</Text>)}
      </Box>
    </Box>
  )
}

const Prompt = ({ label, buffer, fallback }: {
  readonly label: string
  readonly buffer: InputBuffer
  readonly fallback: string
}) => {
  const { before, cursor, after } = bufferViewModel(buffer)
  return (
    <Box paddingX={1}>
      <Text wrap='truncate-end'>
        {label}: {before}
        {buffer.text.length === 0 && <Text dimColor>({fallback})</Text>}
        <Text inverse>{cursor}</Text>
        {after}
      </Text>
    </Box>
  )
}

export const InstallApp = (
  {
    repo = repoDirectoryBuffer,
    user = userDirectoryBuffer,
    step = installStep,
  }: InstallAppProps,
) => {
  const { exit } = useApp()
  const { isRawModeSupported } = useStdin()
  const { stdout } = useStdout()
  const repoDirectory = useSignalValue(repo)
  const userDirectoryValue = useSignalValue(user)
  const currentStep = useSignalValue(step)

  useInput((input, key) => {
    if (isQuit(input, key)) exit()
    else if (key.return === true) {
      if (step.peek() === 'repo') step.value = 'user'
      else exit()
    } else edit(input, key, step.peek() === 'repo' ? repo : user)
  }, { isActive: isRawModeSupported })

  return (
    <Box
      flexDirection='column'
      height={stdout.rows || 24}
      width={stdout.columns || 80}
    >
      <Header />
      {currentStep === 'user' && (
        <Config user={userDirectoryValue} repo={repoDirectory} />
      )}
      <Box flexDirection='column' flexGrow={1} justifyContent='flex-end'>
        {currentStep === 'repo' && (
          <Prompt
            label='What directory for the local repo crow setup'
            buffer={repoDirectory}
            fallback={defaultRepoDirectory}
          />
        )}
        {currentStep === 'user' && (
          <Prompt
            label='User crow directory'
            buffer={userDirectoryValue}
            fallback={defaultUserDirectory}
          />
        )}
      </Box>
    </Box>
  )
}
