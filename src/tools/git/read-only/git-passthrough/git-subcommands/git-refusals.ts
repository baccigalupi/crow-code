export class GitRefusals {
  unknownSubcommand(name: string, allowed: string[]) {
    return `subcommand not allowed: ${name || '(none)'}; allowed subcommands: ${this.list(allowed)}`
  }

  formNotAllowed(attempted: string, name: string, forms: string[]) {
    return `subcommand not allowed: ${attempted}; allowed forms for ${name}: ${this.list(forms)}`
  }

  argumentNotAllowed(offenders: string[]) {
    return `argument not allowed: ${offenders.join(', ')}`
  }

  flagsNotAllowed(offenders: string[], name: string, allowed: string[]) {
    return `flag not allowed: ${offenders.join(', ')}; allowed flags for ${name}: ${this.list(allowed)}`
  }

  valuesNotNumbers(badNumbers: string[]) {
    return `flag value not a number: ${badNumbers.join(', ')}`
  }

  private list(names: string[]) {
    if (names.length === 0) return 'none'
    return [...names].sort().join(', ')
  }
}
