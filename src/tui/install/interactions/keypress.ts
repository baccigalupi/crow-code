import type { ExitApp, KeyFlags } from '../../types.ts'
import type { UserInputStore, KeypressArguments } from '../types.ts'
import { currentStep } from '../steps/current.ts'
import { textInput } from './text-input.ts'

export class Keypress {
  private userInputStore: UserInputStore
  private exit: ExitApp
  private input: string
  private key: KeyFlags

  constructor({ userInputStore, exit, input, key }: KeypressArguments) {
    this.userInputStore = userInputStore
    this.exit = exit
    this.input = input
    this.key = key
  }

  handle() {
    if (this.isQuit()) this.exit()
    else if (this.userInputStore.step.peek() === 'done') this.exit()
    else if (this.isCancel()) this.cancel()
    else if (this.userInputStore.step.peek() === 'confirm') this.confirm()
    else if (this.key.return === true) this.advance()
    else if (this.key.tab === true) this.tab()
    else this.activeEdit()
  }

  // Tab walks the fields of a grouped step; shift+tab walks back.
  private tab() {
    const step = currentStep(this.userInputStore)
    if ('focus' in step) step.focus(this.tabDirection())
  }

  private tabDirection() {
    if (this.key.shift === true) return -1
    return 1
  }

  private advance() {
    const step = currentStep(this.userInputStore)
    if ('advance' in step) step.advance()
    else this.userInputStore.step.value = step.nextStep
  }

  // Escape opts out of the current prompt; steps without cancel ignore it.
  private cancel() {
    const step = currentStep(this.userInputStore)
    if ('cancel' in step) step.cancel()
  }

  private confirm() {
    if (this.choosesYes()) this.userInputStore.confirmation.value = true
    else if (this.choosesNo()) this.userInputStore.confirmation.value = false
    else if (this.key.return === true) this.decide()
  }

  private choosesYes() {
    if (this.key.leftArrow === true || this.key.upArrow === true) return true
    return this.input === 'y' || this.input === 'k'
  }

  private choosesNo() {
    if (this.key.rightArrow === true || this.key.downArrow === true) return true
    return this.input === 'n' || this.input === 'j'
  }

  private decide() {
    if (this.userInputStore.confirmation.peek() === true) this.completeSetup()
    else this.exit()
  }

  private completeSetup() {
    this.userInputStore.step.value = 'completeSetup'
  }

  private activeEdit() {
    textInput({
      text: this.activeText(),
      input: this.input,
      key: this.key,
    }).edit()
  }

  private activeText() {
    return currentStep(this.userInputStore).state()
  }

  private isQuit() {
    return this.key.ctrl === true && this.input === 'c'
  }

  private isCancel() {
    return this.key.escape === true || this.input === '\x1b'
  }
}

export const keypress = (keypressArguments: KeypressArguments) => {
  return new Keypress(keypressArguments)
}
