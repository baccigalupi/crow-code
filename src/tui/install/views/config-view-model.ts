import {
  defaultRepoDirectory,
  defaultUserDirectory,
} from '../interactions/state/directory-buffer.ts'
import type { InputBuffer } from '../../types.ts'

type ConfigViewModelArguments = {
  readonly user: InputBuffer
  readonly repo: InputBuffer
}

const directory = (buffer: InputBuffer, fallback: string) => {
  if (buffer.text.length === 0) return fallback
  return buffer.text
}

export const configViewModel = ({ user, repo }: ConfigViewModelArguments) => {
  const repoDirectory = directory(repo, defaultRepoDirectory)
  const userDirectory = directory(user, defaultUserDirectory)
  return {
    filePath: `${repoDirectory}/config.json`,
    json: JSON.stringify({ userDirectory }, null, 2),
  }
}
