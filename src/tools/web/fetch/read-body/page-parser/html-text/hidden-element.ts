export class HiddenElement {
  private element: HTMLRewriterTypes.Element
  private hidingStyle =
    /display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(?![.\d])|opacity\s*:\s*0(?![.\d])/i

  constructor(element: HTMLRewriterTypes.Element) {
    this.element = element
  }

  hidden() {
    return (
      this.element.hasAttribute('hidden') ||
      this.ariaHidden() ||
      this.hidingStyle.test(this.element.getAttribute('style') || '')
    )
  }

  private ariaHidden() {
    const value = this.element.getAttribute('aria-hidden') || ''
    return value.toLowerCase() === 'true'
  }
}
