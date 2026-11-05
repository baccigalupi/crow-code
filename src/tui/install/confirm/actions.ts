import type { PromptArguments } from '../types.ts'
import type { ConfirmPanel } from './confirm.tsx'

// What the Yes/No select does: highlighting an option sets the answer,
// picking Yes moves on and picking No quits. Yes is option 0.
export class ConfirmActions {
  private actionArguments: PromptArguments<ConfirmPanel>

  constructor(actionArguments: PromptArguments<ConfirmPanel>) {
    this.actionArguments = actionArguments
  }

  change() {
    const { confirm } = this.actionArguments.store
    return (index: number) => confirm.choose(index === 0)
  }

  select() {
    return (index: number) => this.decide(index === 0)
  }

  private decide(yes: boolean) {
    const { panel, navigation } = this.actionArguments
    if (yes) navigation.goTo(panel.next)
    else navigation.exit()
  }
}
