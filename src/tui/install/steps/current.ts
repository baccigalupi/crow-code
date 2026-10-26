import type { UserInputStore } from '../types.ts'
import { RepoStep } from './repo.ts'
import { CrowGlobalDirectoryStep } from './crow-global-directory.ts'
import { EnvFileStep } from './env-file.ts'
import { IgnoreStep } from './ignore.ts'
import { AdditionalReadStep } from './additional-read.ts'
import { AdditionalWriteStep } from './additional-write.ts'
import { EscalateReadStep } from './escalate-read.ts'
import { EscalateWriteStep } from './escalate-write.ts'
import { AllowedLocalScriptsStep } from './allowed-local-scripts.ts'
import { ProviderNameStep } from './provider-name.ts'
import { ProviderUrlStep } from './provider-url.ts'
import { ProviderCredentialsStep } from './provider-credentials.ts'
import { ConfirmStep } from './confirm.ts'
import { CompleteSetupStep } from './complete-setup.ts'
import { DoneStep } from './done.ts'
import { DefaultStep } from './default.ts'

const stepClasses = [
  RepoStep,
  CrowGlobalDirectoryStep,
  EnvFileStep,
  IgnoreStep,
  AdditionalReadStep,
  AdditionalWriteStep,
  EscalateReadStep,
  EscalateWriteStep,
  AllowedLocalScriptsStep,
  ProviderNameStep,
  ProviderUrlStep,
  ProviderCredentialsStep,
  ConfirmStep,
  CompleteSetupStep,
  DoneStep,
]

export class CurrentStep {
  private userInputStore: UserInputStore

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  step() {
    return this.userInputStore.step.peek()
  }

  current() {
    return (
      this.all().find((step) => step.name === this.step()) ||
      new DefaultStep(this.userInputStore)
    )
  }

  all() {
    return stepClasses.map((Step) => new Step(this.userInputStore))
  }
}

export const currentStep = (userInputStore: UserInputStore) => {
  return new CurrentStep(userInputStore).current()
}
