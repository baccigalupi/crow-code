type Runner = { run(): void }

export const start = (runner: Runner | undefined) => {
  if (runner) return runner?.run()
  return 'ok'
}
