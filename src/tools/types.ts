export type GitLogEntry = {
  sha: string
  author: string
  date: string
  subject: string
}

export type GitBlameLine = {
  line: number
  sha: string
  author: string
  date: string
  summary: string
  content: string
}

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

export type EditResult = {
  path: string
  replacements: number
}

export type EditInstruction = {
  path: string
  oldString: string
  newString: string
  replaceAll?: boolean
}

export type MultiEditResult = EditResult[]

export type SnapshotEntry = [path: string, text: string]

export type MakeDirectoryResult = {
  path: string
  created: boolean
}

export type WriteResult = {
  path: string
  created: boolean
}

export type MoveResult = {
  from: string
  to: string
}

export type DeleteResult = {
  path: string
  deleted: boolean
}

export type PathExistsResult = {
  path: string
  exists: boolean
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
  before?: string[]
  after?: string[]
}

export type SearchListing = {
  path: string
  matches: SearchMatch[]
}

export type PathListing = {
  path: string
  paths: string[]
}
