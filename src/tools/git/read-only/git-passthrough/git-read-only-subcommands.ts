import type { GitSubcommand } from '../../../types.ts'

export const gitReadOnlySubcommands: Record<string, GitSubcommand> = {
  log: {
    flags: {
      '--oneline': 'switch',
      '--stat': 'switch',
      '--name-only': 'switch',
      '--name-status': 'switch',
      '--follow': 'switch',
      '--no-merges': 'switch',
      '--format': 'text',
      '-n': 'number',
      '-p': 'switch',
    },
  },
}
