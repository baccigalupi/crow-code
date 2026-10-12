import type { CrowConfigData } from '../types.ts'

export class CrowConfig {
  crowRepoDirectory: string
  private data: CrowConfigData

  constructor(crowRepoDirectory: string, data: CrowConfigData) {
    this.data = data
    this.crowRepoDirectory = crowRepoDirectory
  }

  get crowGlobalDirectory() {
    return this.data.crowGlobalDirectory
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
