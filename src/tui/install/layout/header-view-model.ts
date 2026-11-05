import { theme } from '../theme.ts'

// The chrome colors the header rows are drawn in.
export class HeaderViewModel {
  readonly background = theme.chrome.background
  readonly textColor = theme.chrome.textColor
}

export const headerViewModel = () => new HeaderViewModel()
