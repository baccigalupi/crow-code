import { defaultCrowConfig } from '../../../../domain/config.ts'
import { TextStep } from '../text-step.ts'

export class AllowedLocalScriptsStep extends TextStep {
  readonly name = 'allowedLocalScripts'
  readonly label = 'Allowed local scripts'
  readonly next = 'providerName'

  defaultValue() {
    return defaultCrowConfig().permissions.allowedLocalScripts.join(', ')
  }
}
