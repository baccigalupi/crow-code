export const mockStdin = ({ rawMode = true } = {}) => {
  const stdin: NodeJS.ReadStream = Object.create(process.stdin, {
    setRawMode: { value: rawMode ? () => stdin : undefined },
  })
  return stdin
}

export const mockStdout = ({ columns = 80, rows = 24 } = {}) => {
  const stdout: NodeJS.WriteStream = Object.create(process.stdout, {
    columns: { value: columns },
    rows: { value: rows },
    write: { value: () => true },
  })
  return stdout
}
