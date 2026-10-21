const excluded = [/^src\/database\/migrations\//, /^src\/application-data\.ts$/]

const isExcluded = (relative: string) => {
  return excluded.some((pattern) => pattern.test(relative))
}

export const shouldInstrument = (path: string, root: string) => {
  if (!path.startsWith(`${root}/`)) {
    return false
  }

  const relative = path.slice(root.length + 1)

  return /^src\/.*\.tsx?$/.test(relative) && !isExcluded(relative)
}
