export type GitFileDiff = {
  path: string
  diff: string
}

export type ChangedFile = {
  path: string
  changeType: string
}

export type FileContent = {
  path: string
  text: string
}
