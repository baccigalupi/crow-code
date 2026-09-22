import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { commandAllowed } from '../../../agents/hooks/command-allowed.ts'

describe('commandAllowed', () => {
  it('when command is an agents script, returns true', () => {
    const command = 'agents/typecheck'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is a dev script, returns true', () => {
    const command = 'dev/test'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is bd, returns true', () => {
    const command = 'bd ready'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is git status, returns true', () => {
    const command = 'git status'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is a simple quoted git commit, returns true', () => {
    const command = 'git commit -m "subject"'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command uses the canonical cat heredoc commit form, returns true', () => {
    const command = `git commit -m "$(cat <<'EOF'\nbody\nEOF\n)"`

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is a plain curl request, returns true', () => {
    const command = 'curl https://api.example.com'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is a curl request with flags, returns true', () => {
    const command = 'curl -s -H Authorization:Basic https://api.example.com'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command chains two allowed segments, returns true', () => {
    const command = 'curl https://a && curl https://b'

    const result = commandAllowed(command)

    expect(result).toBe(true)
  })

  it('when command is git push, returns false', () => {
    const command = 'git push'

    const result = commandAllowed(command)

    expect(result).toBe(false)
  })

  it('when command is an unrelated executable, returns false', () => {
    const command = 'echo hello'

    const result = commandAllowed(command)

    expect(result).toBe(false)
  })

  it('when command contains a destructive executable, returns false', () => {
    const command = 'rm -rf /'

    const result = commandAllowed(command)

    expect(result).toBe(false)
  })

  it('when command chains allowed and blocked segments, returns false', () => {
    const command = 'curl https://x && rm -rf /'

    const result = commandAllowed(command)

    expect(result).toBe(false)
  })

  it('when command has a redirect, returns false', () => {
    const command = 'curl https://x > out'

    const result = commandAllowed(command)

    expect(result).toBe(false)
  })

  it('when command has an unclosed quote, returns false', () => {
    const command = 'git commit -m "subject'

    const result = commandAllowed(command)

    expect(result).toBe(false)
  })
})
