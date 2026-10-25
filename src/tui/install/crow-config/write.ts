import { effect } from '@preact/signals-core'
import type { Filesystem } from '../../../application-data/filesystem.ts'
import type { InstallStore, WriteCrowConfigArguments } from '../types.ts'
import { readInstallState } from '../interactions/state/read-install-state.ts'
import { buildCrowConfig } from './build.ts'

// WRITE side: watches the install step and, once the user has confirmed
// (step 'write'), creates the repo directory and writes config.json through
// the filesystem, then marks the step done. Plain TS outside the views and
// hooks; nothing in the TUI sees the filesystem. Deriving the config lives in
// build.ts.
export class CrowConfigWrite {
  private installData: InstallStore
  private filesystem: Filesystem

  constructor({ installData, filesystem }: WriteCrowConfigArguments) {
    this.installData = installData
    this.filesystem = filesystem
  }

  subscribe() {
    return effect(() => {
      if (this.installData.step.value === 'write') this.write()
    })
  }

  private write() {
    this.save().then(() => {
      this.installData.step.value = 'done'
    })
  }

  private async save() {
    const { crowRepoDirectory, crowConfigPath, crowConfigJson } = this.config()
    await this.filesystem.mkdirWithParents(crowRepoDirectory)
    await this.filesystem.writeTextFile(crowConfigPath, `${crowConfigJson}\n`)
  }

  private config() {
    return buildCrowConfig(readInstallState(this.installData)).all()
  }
}

export const writeCrowConfig = (
  writeCrowConfigArguments: WriteCrowConfigArguments,
) => {
  return new CrowConfigWrite(writeCrowConfigArguments)
}
