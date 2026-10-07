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

export type DirectoryEntryKind = 'file' | 'directory' | 'symlink'

export type DirectoryEntry = {
  path: string
  kind: DirectoryEntryKind
}

export type DirectoryListing = {
  path: string
  entries: DirectoryEntry[]
}

export type SearchMatch = {
  path: string
  line: number
  text: string
}

export type SearchListing = {
  path: string
  matches: SearchMatch[]
}
