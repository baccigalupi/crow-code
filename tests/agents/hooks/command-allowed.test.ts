import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { commandAllowed } from '../../../agents/hooks/command-allowed.ts'
import { DevinConfig } from '../../../agents/hooks/devin-config.ts'

const json = Deno.readTextFileSync('tests/support/fixtures/devin-config.json')
const config = new DevinConfig(json)

describe('commandAllowed', () => {
  it('when command is an agents script, returns true', () => {
    const command = 'agents/typecheck'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a dev script, returns true', () => {
    const command = 'dev/test'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command has a leading prefix, returns true', () => {
    const command = './agents/typecheck'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command has a leading env assignment, returns true', () => {
    const command = 'GIT_PAGER=cat git status'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is bd, returns true', () => {
    const command = 'bd ready'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is git status, returns true', () => {
    const command = 'git status'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a simple quoted git commit, returns true', () => {
    const command = 'git commit -m "subject"'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a git commit with several -m flags, returns true', () => {
    const command = 'git commit -m "subject" -m "body"'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a quoted-delimiter heredoc git commit, returns true', () => {
    const command = "git commit -F - <<'EOF'\nsubject\n\nbody\nEOF"

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a heredoc git commit ending with a newline, returns true', () => {
    const command = "git commit -F - <<'EOF'\nsubject\n\nbody\nEOF\n"

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a literal multiline git commit, returns true', () => {
    const command = 'git commit -m "subject\n\nbody"'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a literal multiline git commit with several -m flags, returns true', () => {
    const command = 'git commit -m "subject" -m "body\n\nmore body"'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a plain curl request, returns true', () => {
    const command = 'curl https://api.example.com'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command is a curl request with flags, returns true', () => {
    const command = 'curl -s -H Authorization:Basic https://api.example.com'

    const result = commandAllowed(command, config)

    expect(result).toBe(true)
  })

  it('when command uses the cat heredoc substitution bypass, returns false', () => {
    const command = `git commit -m "$(cat <<'EOF'\nbody\nEOF\n)"`

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is a multiline git commit hiding command substitution, returns false', () => {
    const command = 'git commit -m "subject\n$(whoami)"'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is a multiline git commit hiding backticks, returns false', () => {
    const command = 'git commit -m "subject\n`whoami`"'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is a multiline git commit with unquoted shell syntax, returns false', () => {
    const command = 'git commit -m "subject\nbody"\nrm -rf /'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command contains command substitution, returns false', () => {
    const command = 'echo $(whoami)'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command contains backticks, returns false', () => {
    const command = 'echo `whoami`'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command has a redirect, returns false', () => {
    const command = 'curl https://x > out'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command chains with &&, returns false', () => {
    const command = 'curl https://a && curl https://b'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command chains with a semicolon, returns false', () => {
    const command = 'git status; rm -rf /'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command has a bare newline, returns false', () => {
    const command = 'git status\nrm -rf /'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is an unquoted-delimiter heredoc, returns false', () => {
    const command = 'git commit -F - <<EOF\nbody\nEOF'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when heredoc body hides an early delimiter line, returns false', () => {
    const command = "git commit -F - <<'EOF'\nEOF\nrm -rf /\nEOF"

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is git push, returns false', () => {
    const command = 'git push'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is git push with a -C flag, returns false', () => {
    const command = 'git -C dir push'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command is an unrelated executable, returns false', () => {
    const command = 'echo hello'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command contains a destructive executable, returns false', () => {
    const command = 'rm -rf /'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when command has an unclosed double quote, returns false', () => {
    const command = 'git commit -m "subject'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when an agents script is absent from config, returns false', () => {
    const command = 'agents/random-script'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })

  it('when a dev script is absent from config, returns false', () => {
    const command = 'dev/random-script'

    const result = commandAllowed(command, config)

    expect(result).toBe(false)
  })
})
