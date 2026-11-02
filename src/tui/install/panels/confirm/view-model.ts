import type { StepValues } from '../../types.ts'

type ConfirmPromptValues = Pick<StepValues, 'confirmation'>

// Which of Yes and No the confirm prompt has selected.
export class ConfirmPromptViewModel {
  props({ confirmation }: ConfirmPromptValues) {
    if (confirmation) {
      return { selectedIndex: 0 }
    } else {
      return { selectedIndex: 1 }
    }
  }
}
