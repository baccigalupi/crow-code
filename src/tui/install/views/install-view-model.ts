type InstallViewModelArguments = {
  readonly stdout: NodeJS.WriteStream
}

export const installViewModel = ({ stdout }: InstallViewModelArguments) => {
  return {
    rowHeight: stdout.rows || 24,
    columnWidth: stdout.columns || 80,
  }
}
