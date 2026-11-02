type ConfirmPromptValues = {
  readonly confirmation: boolean
}

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
