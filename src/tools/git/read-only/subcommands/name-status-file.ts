export const nameStatusFile = (line: string) => {
  const fields = line.split('\t')
  return { status: fields[0], path: fields[fields.length - 1] }
}
