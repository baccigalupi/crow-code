import { installConfig } from '../install-config.ts'
import type { InputBuffer } from '../../types.ts'

type ConfigViewModelArguments = {
  readonly user: InputBuffer
  readonly repo: InputBuffer
}

export const configViewModel = ({ user, repo }: ConfigViewModelArguments) => {
  const { filePath, json } = installConfig({ user, repo }).all()
  return { filePath, json }
}
