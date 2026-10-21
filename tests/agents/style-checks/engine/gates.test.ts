import { describe, expect, it } from 'bun:test'
import {
  isAnySourceFile,
  isHooksFile,
  isInstallFile,
  isProductionFile,
  isTestFile,
  isTestSupportFile,
  isTsxFile,
} from '../../../../agents/style-checks/engine/gates.ts'

describe('gates', () => {
  it('when isProductionFile gets a src ts path, returns true', () => {
    const fileName = 'src/a/b.ts'

    const result = isProductionFile(fileName)

    expect(result).toBe(true)
  })

  it('when isProductionFile gets a src test path, returns false', () => {
    const fileName = 'src/a.test.ts'

    const result = isProductionFile(fileName)

    expect(result).toBe(false)
  })

  it('when isProductionFile gets a src tsx path, returns false', () => {
    const fileName = 'src/a.tsx'

    const result = isProductionFile(fileName)

    expect(result).toBe(false)
  })

  it('when isProductionFile gets a tests path, returns false', () => {
    const fileName = 'tests/a.test.ts'

    const result = isProductionFile(fileName)

    expect(result).toBe(false)
  })

  it('when isTestFile gets a tsx test path, returns true', () => {
    const fileName = 'tests/a/b.test.tsx'

    const result = isTestFile(fileName)

    expect(result).toBe(true)
  })

  it('when isTestSupportFile gets a support path, returns true', () => {
    const fileName = 'tests/support/x.ts'

    const result = isTestSupportFile(fileName)

    expect(result).toBe(true)
  })

  it('when isTestSupportFile gets a test path, returns false', () => {
    const fileName = 'tests/a.test.ts'

    const result = isTestSupportFile(fileName)

    expect(result).toBe(false)
  })

  it('when isAnySourceFile gets a src tsx path, returns true', () => {
    const fileName = 'src/a.tsx'

    const result = isAnySourceFile(fileName)

    expect(result).toBe(true)
  })

  it('when isAnySourceFile gets a src tsx test path, returns false', () => {
    const fileName = 'src/a.test.tsx'

    const result = isAnySourceFile(fileName)

    expect(result).toBe(false)
  })

  it('when isTsxFile gets a src tsx path, returns true', () => {
    const fileName = 'src/tui/a.tsx'

    const result = isTsxFile(fileName)

    expect(result).toBe(true)
  })

  it('when isTsxFile gets a ts path, returns false', () => {
    const fileName = 'src/a.ts'

    const result = isTsxFile(fileName)

    expect(result).toBe(false)
  })

  it('when isHooksFile gets a hooks directory path, returns true', () => {
    const fileName = 'src/tui/hooks/use-x.ts'

    const result = isHooksFile(fileName)

    expect(result).toBe(true)
  })

  it('when isInstallFile gets a tests tui install path, returns true', () => {
    const fileName = 'tests/tui/install/a.ts'

    const result = isInstallFile(fileName)

    expect(result).toBe(true)
  })
})
