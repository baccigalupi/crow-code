import { PathsTextStep } from '../paths-text-step.ts'

export class EscalateWriteStep extends PathsTextStep {
  readonly name = 'escalateWrite'
  readonly label = 'Escalate write directories'
  readonly next = 'allowedLocalScripts'
  readonly defaultPaths = ['./dev', './agent']
}
