const removed = [
  'GIT_DIR',
  'GIT_WORK_TREE',
  'GIT_INDEX_FILE',
  'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_NAMESPACE',
  'GIT_CEILING_DIRECTORIES',
  'GIT_EXTERNAL_DIFF',
  'GIT_ASKPASS',
  'SSH_ASKPASS',
]

const settings = {
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_PAGER: 'cat',
  PAGER: 'cat',
  GIT_EDITOR: ':',
  EDITOR: ':',
  GIT_LITERAL_PATHSPECS: '1',
}

export const gitSafeReadEnv = (
  parent: Record<string, string>,
): Record<string, string> => {
  const env = { ...parent }
  removed.forEach((name) => delete env[name])
  return { ...env, ...settings }
}

const prefix = [
  '--no-pager',
  '-c',
  'core.fsmonitor=false',
  '-c',
  'core.hooksPath=/dev/null',
  '-c',
  'core.pager=cat',
  '-c',
  'diff.external=',
  '-c',
  'protocol.allow=never',
  '-c',
  'core.untrackedCache=false',
]

export const gitSafeReadSubcommand = (subcommand: string[]) =>
  prefix.concat(subcommand)
