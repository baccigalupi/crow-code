import { PathsTextStep } from '../paths-text-step.ts'

export class AllowedLocalScriptsStep extends PathsTextStep {
  readonly name = 'allowedLocalScripts'
  readonly label = 'Allowed local scripts'
  readonly next = 'providerName'
  readonly defaultPaths = ['./dev/*', './agent/*']
}
