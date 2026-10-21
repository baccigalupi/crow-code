import { InstallStore } from '../types.ts'
import { RepoStep } from './repo.ts'
import { CrowGlobalDirectoryStep } from './crow-global-directory.ts'
import { EnvFileStep } from './env-file.ts'
import { AdditionalReadStep } from './additional-read.ts'
import { EscalateReadStep } from './escalate-read.ts'
import { EscalateWriteStep } from './escalate-write.ts'
import { AllowedLocalScriptsStep } from './allowed-local-scripts.ts'
import { ConfirmStep } from './confirm.ts'
import { DoneStep } from './done.ts'
import { DefaultStep } from './default.ts'

const stepClasses = [
  RepoStep,
  CrowGlobalDirectoryStep,
  EnvFileStep,
  AdditionalReadStep,
  EscalateReadStep,
  EscalateWriteStep,
  AllowedLocalScriptsStep,
  ConfirmStep,
  DoneStep,
]

export class CurrentStep {
  private installStore: InstallStore

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  step() {
    return this.installStore.step.peek()
  }

  current() {
    return this.all().find((step) => step.name === this.step()) ||
      new DefaultStep(this.installStore)
  }

  all() {
    return stepClasses.map((Step) => new Step(this.installStore))
  }
}

export const currentStep = (installStore: InstallStore) => {
  return new CurrentStep(installStore).current()
}
