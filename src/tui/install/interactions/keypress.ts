import type { ExitApp, KeyFlags } from '../../types.ts'
import type { DataStore } from '../data-store.ts'
import type { KeypressArguments } from '../types.ts'
import { CurrentStep } from '../steps/current.ts'
import { TextInput } from './text-input.ts'

export class Keypress {
  private model: DataStore
  private exit: ExitApp
  private input: string
  private key: KeyFlags

  constructor({ model, exit, input, key }: KeypressArguments) {
    this.model = model
    this.exit = exit
    this.input = input
    this.key = key
  }

  handle() {
    if (this.isQuit()) this.exit()
    else if (this.model.step.current.peek() === 'done') this.exit()
    else if (this.isCancel()) this.cancel()
    else if (this.model.step.current.peek() === 'confirm') this.confirm()
    else if (this.key.return === true) this.advance()
    else if (this.key.tab === true) this.tab()
    else this.activeEdit()
  }

  // Tab walks the fields of a grouped step; shift+tab walks back.
  private tab() {
    const step = this.currentStep()
    if ('focus' in step) step.focus(this.tabDirection())
  }

  private tabDirection() {
    if (this.key.shift === true) return -1
    return 1
  }

  private advance() {
    const step = this.currentStep()
    if ('advance' in step) step.advance()
    else this.model.step.goTo(step.nextStep)
  }

  // Escape opts out of the current prompt; steps without cancel ignore it.
  private cancel() {
    const step = this.currentStep()
    if ('cancel' in step) step.cancel()
  }

  private confirm() {
    if (this.choosesYes()) this.model.confirm.choose(true)
    else if (this.choosesNo()) this.model.confirm.choose(false)
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
    if (this.model.confirm.confirmed.peek() === true) this.completeSetup()
    else this.exit()
  }

  private completeSetup() {
    this.model.step.goTo('completeSetup')
  }

  private activeEdit() {
    const field = this.currentStep().field()
    new TextInput({ field, input: this.input, key: this.key }).edit()
  }

  private currentStep() {
    return new CurrentStep(this.model).current()
  }

  private isQuit() {
    return this.key.ctrl === true && this.input === 'c'
  }

  private isCancel() {
    return this.key.escape === true || this.input === '\x1b'
  }
}
