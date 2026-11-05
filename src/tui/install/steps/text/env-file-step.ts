import { TextStep } from '../text-step.ts'

export class EnvFileStep extends TextStep {
  readonly name = 'envFile'
  readonly label = 'Credentials .env file'
  readonly next = 'ignore'
}
