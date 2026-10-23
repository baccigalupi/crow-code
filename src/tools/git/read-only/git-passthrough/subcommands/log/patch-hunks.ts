const hunkHeader = /^diff --git a\/(.+) b\/(.+)$/gm

export class GitPatchHunks {
  private patch: string

  constructor(patch: string) {
    this.patch = patch
  }

  paths() {
    return this.hunks().flatMap((hunk) => this.hunkPaths(hunk))
  }

  without(forbidden: string[]) {
    return this.hunks()
      .filter((hunk) => this.allowed(hunk, forbidden))
      .join('\n')
  }

  private allowed(hunk: string, forbidden: string[]) {
    return !this.hunkPaths(hunk).some((path) => forbidden.includes(path))
  }

  private hunkPaths(hunk: string) {
    return [...hunk.matchAll(hunkHeader)].flatMap((match) => match.slice(1))
  }

  private hunks() {
    return this.patch.split(/\n(?=diff --git )/).filter((hunk) => hunk !== '')
  }
}
