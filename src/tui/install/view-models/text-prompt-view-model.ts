import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import type { DirectoriesStore } from '../data-stores/directories-store.ts'
import type { PermissionsStore } from '../data-stores/permissions-store.ts'
import type {
  CrowConfigInputs,
  TextPromptInputKey,
  TextPromptStep,
  TextPromptViewModelArguments,
} from '../types.ts'

// What the one-line text prompts show for their step: the question, the
// answer typed so far and the default that stands in until something is typed.
export class TextPromptViewModel {
  private directories: DirectoriesStore
  private permissions: PermissionsStore
  private readonly labels: Record<string, string> = Object.fromEntries([
    ['repo', 'What directory for the local repo crow setup'],
    ['crowGlobalDirectory', 'User crow directory'],
    ['envFile', 'Credentials .env file'],
    ['ignore', 'Ignored paths'],
    ['additionalRead', 'Additional read directories'],
    ['additionalWrite', 'Additional write directories'],
    ['escalateRead', 'Escalate read directories'],
    ['escalateWrite', 'Escalate write directories'],
    ['allowedLocalScripts', 'Allowed local scripts'],
  ])
  private readonly inputKeys: Record<string, TextPromptInputKey> =
    Object.fromEntries([
      ['repo', 'repoDirectory'],
      ['crowGlobalDirectory', 'globalDirectory'],
      ['envFile', 'envFile'],
      ['ignore', 'ignore'],
      ['additionalRead', 'additionalRead'],
      ['additionalWrite', 'additionalWrite'],
      ['escalateRead', 'escalateRead'],
      ['escalateWrite', 'escalateWrite'],
      ['allowedLocalScripts', 'allowedLocalScripts'],
    ])
  private readonly bareSteps: readonly TextPromptStep[] = [
    'ignore',
    'additionalRead',
    'additionalWrite',
    'escalateRead',
  ]

  constructor({ directories, permissions }: TextPromptViewModelArguments) {
    this.directories = directories
    this.permissions = permissions
  }

  props(step: TextPromptStep, values: CrowConfigInputs) {
    return {
      label: this.labels[step],
      input: values[this.inputKeys[step]],
      defaultValue: this.defaults(values)[step],
      bare: this.bareSteps.includes(step),
    }
  }

  private defaults(values: CrowConfigInputs): Record<string, string> {
    return Object.fromEntries([
      ...this.directoryDefaults(values),
      ...this.readDefaults(),
      ...this.writeDefaults(),
    ])
  }

  private directoryDefaults(values: CrowConfigInputs) {
    return [
      ['repo', this.directories.defaultRepoDirectory],
      ['crowGlobalDirectory', this.directories.defaultGlobalDirectory],
      ['envFile', crowConfigFromInputs(values).crowConfig().envFile],
    ]
  }

  private readDefaults() {
    return [
      ['ignore', this.permissions.defaultIgnore],
      ['additionalRead', this.permissions.defaultAdditionalRead],
      ['escalateRead', this.permissions.defaultEscalateRead],
    ]
  }

  private writeDefaults() {
    return [
      ['additionalWrite', this.permissions.defaultAdditionalWrite],
      ['escalateWrite', this.permissions.defaultEscalateWrite],
      ['allowedLocalScripts', this.permissions.defaultAllowedLocalScripts],
    ]
  }
}
