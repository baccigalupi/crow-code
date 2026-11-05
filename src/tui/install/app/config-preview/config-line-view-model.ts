import type { ConfigLineArguments } from '../../types.ts'
import { theme } from '../../../theme.ts'

// Whether one config line is highlighted, and the colors it takes when it is:
// it is when the selected step is the step that edits it.
export class ConfigLineViewModel {
  readonly textColor = theme.configPanel.highlightTextColor
  readonly background = theme.configPanel.highlightBackground
  private step: string
  private editable: boolean
  private selectedStep: string

  // A line is editable unless it says otherwise.
  constructor({ step, editable = true, selectedStep }: ConfigLineArguments) {
    this.step = step
    this.editable = editable
    this.selectedStep = selectedStep
  }

  highlighted() {
    return this.editable && this.selectedStep === this.step
  }
}

export const configLineViewModel = (configLineArguments: ConfigLineArguments) =>
  new ConfigLineViewModel(configLineArguments)
