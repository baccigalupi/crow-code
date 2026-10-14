type InstallAppViewModelArguments = {
  readonly stdout: NodeJS.WriteStream
}

export const installAppViewModel = (
  { stdout }: InstallAppViewModelArguments,
) => {
  return {
    rowHeight: stdout.rows || 24,
    columnWidth: stdout.columns || 80,
  }
}
