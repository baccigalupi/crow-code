import { crayon } from 'crayon'

export const chromeColors = {
  gold: '#e6ca6c',
  darkGreen: '#0B3D2E',
}

export const chromeTheme = {
  base: crayon.bgHex(chromeColors.darkGreen).hex(chromeColors.gold),
}
