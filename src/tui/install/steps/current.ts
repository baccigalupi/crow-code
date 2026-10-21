import { InstallState } from '../types.ts'
import { RepoStep } from './repo.ts'
import { CrowGlobalDirectoryStep } from './crow-global-directory.ts'
import { EnvFileStep } from './env-file.ts'
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
  EscalateReadStep,
  EscalateWriteStep,
  AllowedLocalScriptsStep,
  ConfirmStep,
  DoneStep,
]

export class CurrentStep {
  private installState: InstallState

  constructor(installState: InstallState) {
    this.installState = installState
  }

  step() {
    return this.installState.step.peek()
  }

  current() {
    return this.all().find((step) => step.name === this.step()) ||
      new DefaultStep(this.installState)
  }

  all() {
    return stepClasses.map((Step) => new Step(this.installState))
  }
}

export const currentStep = (installState: InstallState) => {
  return new CurrentStep(installState).current()
}
