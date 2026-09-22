import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { shellSegments } from '../../../agents/hooks/shell-segments.ts'

describe('shellSegments', () => {
  it('when command is a simple quoted git commit, returns one segment', () => {
    const command = 'git commit -m "subject"'

    const result = shellSegments(command)

    expect(result).toEqual(['git commit -m subject'])
  })

  it('when command contains a cat heredoc substitution, consumes the substitution', () => {
    const command = `git commit -m "$(cat <<'EOF'\nbody\nEOF\n)"`

    const result = shellSegments(command)

    expect(result).toEqual(['git commit -m \nbody'])
  })

  it('when substitution is not a cat heredoc, returns null', () => {
    const command = 'echo $(whoami)'

    const result = shellSegments(command)

    expect(result).toBeNull()
  })

  it('when command contains backticks, returns null', () => {
    const command = 'echo `whoami`'

    const result = shellSegments(command)

    expect(result).toBeNull()
  })

  it('when command contains a redirect, returns null', () => {
    const command = 'curl https://x > out'

    const result = shellSegments(command)

    expect(result).toBeNull()
  })

  it('when command chains two allowed segments, returns both segments', () => {
    const command = 'curl https://x && git status'

    const result = shellSegments(command)

    expect(result).toEqual(['curl https://x ', ' git status'])
  })

  it('when command has an unclosed quote, returns null', () => {
    const command = 'echo "hello'

    const result = shellSegments(command)

    expect(result).toBeNull()
  })

  it('when command has an unclosed heredoc, returns null', () => {
    const command = "cat <<'EOF'\nbody"

    const result = shellSegments(command)

    expect(result).toBeNull()
  })

  it('when heredoc body contains shell metachars, keeps body literal', () => {
    const command = `cat <<'EOF'\n$(rm -rf /)\nEOF`

    const result = shellSegments(command)

    expect(result).toEqual(['cat '])
  })
})
