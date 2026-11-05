import type { StepName } from '../types.ts'
import { CompleteSetupStep } from './complete-setup-step.tsx'
import { ConfirmStep } from './confirm-step.tsx'
import { DoneStep } from './done-step.tsx'
import { ProviderCredentialsStep } from './provider/provider-credentials-step.ts'
import { ProviderNameStep } from './provider/provider-name-step.ts'
import { ProviderUrlStep } from './provider/provider-url-step.ts'
import type { Step } from './step.ts'
import { AdditionalReadStep } from './text/additional-read-step.ts'
import { AdditionalWriteStep } from './text/additional-write-step.ts'
import { AllowedLocalScriptsStep } from './text/allowed-local-scripts-step.ts'
import { CrowGlobalDirectoryStep } from './text/crow-global-directory-step.ts'
import { EnvFileStep } from './text/env-file-step.ts'
import { EscalateReadStep } from './text/escalate-read-step.ts'
import { EscalateWriteStep } from './text/escalate-write-step.ts'
import { IgnoreStep } from './text/ignore-step.ts'
import { RepoDirectoryStep } from './text/repo-directory-step.ts'

// Every step of the installer, in order, found by name.
export class Steps {
  private readonly steps: readonly Step[] = [
    new RepoDirectoryStep(),
    new CrowGlobalDirectoryStep(),
    new EnvFileStep(),
    new IgnoreStep(),
    new AdditionalReadStep(),
    new AdditionalWriteStep(),
    new EscalateReadStep(),
    new EscalateWriteStep(),
    new AllowedLocalScriptsStep(),
    new ProviderNameStep(),
    new ProviderUrlStep(),
    new ProviderCredentialsStep(),
    new ConfirmStep(),
    new CompleteSetupStep(),
    new DoneStep(),
  ]

  // Every step name has a step here, so the find always matches.
  named(name: StepName) {
    return this.steps.find((step) => step.name === name) as Step
  }
}
