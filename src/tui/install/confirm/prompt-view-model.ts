// The Yes/No option the confirm answer shows as.
export class ConfirmPromptViewModel {
  private confirmed: boolean

  constructor(confirmed: boolean) {
    this.confirmed = confirmed
  }

  selectedIndex() {
    if (this.confirmed) return 0

    return 1
  }
}
