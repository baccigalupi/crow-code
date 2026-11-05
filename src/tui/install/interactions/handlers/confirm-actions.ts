import type { ActionArguments } from '../../types.ts'

// What the Yes/No select does: highlighting an option sets the answer,
// picking Yes starts setup and picking No quits. Yes is option 0.
export class ConfirmActions {
  private actionArguments: ActionArguments

  constructor(actionArguments: ActionArguments) {
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
    const { navigation } = this.actionArguments
    if (yes) navigation.goTo('completeSetup')
    else navigation.exit()
  }
}
