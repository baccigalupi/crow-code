type DevinConfigFile = {
  permissions: {
    allow: string[]
    deny: string[]
  }
}

export class DevinConfig {
  private file: DevinConfigFile

  constructor(json: string) {
    this.file = JSON.parse(json) as DevinConfigFile
  }

  allowsExec(command: string) {
    if (this.matches(command, this.file.permissions.deny)) return false
    return this.matches(command, this.file.permissions.allow)
  }

  private matches(command: string, rules: string[]) {
    return rules.some(this.ruleMatches.bind(this, command))
  }

  private ruleMatches(command: string, rule: string) {
    const match = /^Exec\(([^()]+)\)$/.exec(rule)
    if (match === null) return false
    const prefix = match[1]
    if (!command.startsWith(prefix)) return false
    return command === prefix || /\s/.test(command[prefix.length])
  }
}
