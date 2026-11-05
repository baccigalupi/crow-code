import { TextStep } from '../text-step.ts'

export class AllowedLocalScriptsStep extends TextStep {
  readonly name = 'allowedLocalScripts'
  readonly label = 'Allowed local scripts'
  readonly next = 'providerName'
}
