import { effect } from '@preact/signals-core'
import type { Filesystem } from '../../../application-data/filesystem.ts'
import type { InstallState, WriteCrowConfigArguments } from '../types.ts'
import { buildCrowConfig } from './build.ts'

// WRITE side: watches the install step and, once the user has confirmed
// (step 'write'), creates the repo directory and writes config.json through
// the filesystem, then marks the step done. Plain TS outside the views and
// hooks; nothing in the TUI sees the filesystem. Deriving the config lives in
// build.ts.
export class CrowConfigWrite {
  private signals: InstallState
  private filesystem: Filesystem

  constructor({ signals, filesystem }: WriteCrowConfigArguments) {
    this.signals = signals
    this.filesystem = filesystem
  }

  subscribe() {
    return effect(() => {
      if (this.signals.step.value === 'write') this.write()
    })
  }

  private write() {
    this.save().then(() => {
      this.signals.step.value = 'done'
    })
  }

  private async save() {
    const { crowRepoDirectory, crowConfigPath, crowConfigJson } = this.config()
    await this.filesystem.mkdirWithParents(crowRepoDirectory)
    await this.filesystem.writeTextFile(crowConfigPath, `${crowConfigJson}\n`)
  }

  private config() {
    return buildCrowConfig({
      repoDirectory: this.signals.repoDirectory.peek(),
      globalDirectory: this.signals.globalDirectory.peek(),
      envFile: this.signals.envFile.peek(),
    }).all()
  }
}

export const writeCrowConfig = (
  writeCrowConfigArguments: WriteCrowConfigArguments,
) => {
  return new CrowConfigWrite(writeCrowConfigArguments)
}
