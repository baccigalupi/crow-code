import type { PathPermissions } from '../../../../../../application-data/allowed-paths/path-permissions.ts'
import type {
  GitLogCommit,
  GitLogFile,
  GitLogStat,
} from '../../../../../types.ts'
import { GitPatchHunks } from './patch-hunks.ts'

type PermittedCommitsArguments = {
  permissions: PathPermissions
  commits: GitLogCommit[]
}

export class PermittedCommits {
  private permissions: PathPermissions
  private commits: GitLogCommit[]

  constructor({ permissions, commits }: PermittedCommitsArguments) {
    this.permissions = permissions
    this.commits = commits
  }

  async permitted() {
    const forbidden = await this.permissions.forbiddenPaths(this.paths())
    return this.commits.map((commit) => this.commitWithout(commit, forbidden))
  }

  private paths() {
    const paths = this.commits.flatMap((commit) => this.commitPaths(commit))
    return [...new Set(paths)]
  }

  private commitPaths({ files = [], stat, patch = '' }: GitLogCommit) {
    const hunkPaths = new GitPatchHunks(patch).paths()
    const filePaths = files.map((file) => file.path)
    return [...filePaths, ...this.statPaths(stat), ...hunkPaths]
  }

  private statPaths(stat: GitLogStat | undefined) {
    if (stat === undefined) return []
    return stat.paths.map((entry) => entry.path)
  }

  private commitWithout(commit: GitLogCommit, forbidden: string[]) {
    const { files, stat, patch, ...base } = commit
    return {
      ...base,
      ...this.filesWithout(files, forbidden),
      ...this.statWithout(stat, forbidden),
      ...this.patchWithout(patch, forbidden),
    }
  }

  private filesWithout(files: GitLogFile[] | undefined, forbidden: string[]) {
    if (files === undefined) return {}
    return { files: files.filter((file) => !forbidden.includes(file.path)) }
  }

  private statWithout(stat: GitLogStat | undefined, forbidden: string[]) {
    if (stat === undefined) return {}
    const paths = stat.paths.filter((entry) => !forbidden.includes(entry.path))
    return { stat: { ...stat, paths } }
  }

  private patchWithout(patch: string | undefined, forbidden: string[]) {
    if (patch === undefined) return {}
    return { patch: new GitPatchHunks(patch).without(forbidden) }
  }
}
