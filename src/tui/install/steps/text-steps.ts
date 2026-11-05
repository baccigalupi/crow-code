import type { TextStepName } from '../types.ts'
import type { TextStep } from './text-step.ts'
import { AdditionalReadStep } from './text/additional-read-step.ts'
import { AdditionalWriteStep } from './text/additional-write-step.ts'
import { AllowedLocalScriptsStep } from './text/allowed-local-scripts-step.ts'
import { CrowGlobalDirectoryStep } from './text/crow-global-directory-step.ts'
import { EnvFileStep } from './text/env-file-step.ts'
import { EscalateReadStep } from './text/escalate-read-step.ts'
import { EscalateWriteStep } from './text/escalate-write-step.ts'
import { IgnoreStep } from './text/ignore-step.ts'
import { RepoDirectoryStep } from './text/repo-directory-step.ts'

// The one-line questions, in the order they are asked, found by name.
export class TextSteps {
  private readonly steps: readonly TextStep[] = [
    new RepoDirectoryStep(),
    new CrowGlobalDirectoryStep(),
    new EnvFileStep(),
    new IgnoreStep(),
    new AdditionalReadStep(),
    new AdditionalWriteStep(),
    new EscalateReadStep(),
    new EscalateWriteStep(),
    new AllowedLocalScriptsStep(),
  ]

  all() {
    return this.steps
  }

  // Every text step name has a step here, so the find always matches.
  named(name: TextStepName) {
    return this.steps.find((step) => step.name === name) as TextStep
  }
}
