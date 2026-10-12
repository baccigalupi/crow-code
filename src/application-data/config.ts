import type { CrowConfigData } from '../types.ts'

export class CrowConfig {
  repoDirectory: string
  private data: CrowConfigData

  constructor(repoDirectory: string, data: CrowConfigData) {
    this.data = data
    this.repoDirectory = repoDirectory
  }

  get userDirectory() {
    return this.data.userDirectory
  }

  get ignoredDirectories() {
    return this.data.permissions.ignore
  }

  get writableDirectories() {
    return this.data.permissions.additionalWrite
  }

  get readableDirectories() {
    return this.data.permissions.additionalRead
  }
}
