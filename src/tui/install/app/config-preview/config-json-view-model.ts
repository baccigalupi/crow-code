import type { CrowConfigInputs } from '../../crow-config/types.ts'
import type { PanelHighlights } from '../../types.ts'
import { theme } from '../../../theme.ts'
import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import { highlightJson } from './highlight.ts'

// The crow config json split around the highlighted line, with the numbers
// the view draws it by: the marker row on the highlighted line, the line
// count, and a key that changes with every new json.
export class ConfigJsonViewModel {
  readonly paddingY = 1
  readonly background = theme.configPanel.background
  readonly highlightTextColor = theme.configPanel.highlightTextColor
  readonly highlightBackground = theme.configPanel.highlightBackground
  private inputs: CrowConfigInputs
  private highlights: PanelHighlights

  constructor(inputs: CrowConfigInputs, highlights: PanelHighlights) {
    this.inputs = inputs
    this.highlights = highlights
  }

  before() {
    return this.sections().before
  }

  highlighted() {
    return this.sections().highlighted
  }

  after() {
    return this.sections().after
  }

  markerRow() {
    return this.paddingY + this.before().split('\n').length - 1
  }

  lineCount() {
    return this.key().split('\n').length
  }

  key() {
    return crowConfigFromInputs(this.inputs).crowConfigJson()
  }

  private sections() {
    return highlightJson({ json: this.key(), ...this.highlights })
  }
}
