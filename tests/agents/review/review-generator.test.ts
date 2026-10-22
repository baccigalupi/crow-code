import { describe, expect, it, spyOn } from 'bun:test'
import { main } from '../../../agents/review/review-generator.ts'

describe('agents/review/review-generator', () => {
  it('when a src file is modified, writes its link at the first changed line', async () => {
    const originalArgv = process.argv
    process.argv = ['bun', 'x']
    const done = Bun.spawnSync(['git', '--version'])
    const spawn = spyOn(Bun, 'spawnSync')
      .mockReturnValueOnce({ ...done, stdout: Buffer.from('/repo\n') })
      .mockReturnValueOnce({ ...done, stdout: Buffer.from(' M src/a.ts\n') })
      .mockReturnValueOnce({ ...done, stdout: Buffer.from('@@ -10 +12 @@\n') })
    const write = spyOn(Bun, 'write').mockResolvedValue(0)

    await main()

    expect(spawn).toHaveBeenCalledTimes(3)
    expect(write).toHaveBeenCalledWith(
      '/repo/docs/review.md',
      'Source:\n\n- new files\n  - _none_\n- updates\n  - [src/a.ts](/src/a.ts#L12)\n',
    )
    process.argv = originalArgv
  })

  it('when git fails, exits with status 1', async () => {
    const originalArgv = process.argv
    process.argv = ['bun', 'x']
    const done = Bun.spawnSync(['git', '--version'])
    spyOn(Bun, 'spawnSync')
      .mockReturnValueOnce({ ...done, stdout: Buffer.from('/repo\n') })
      .mockReturnValueOnce({
        ...done,
        success: false,
        stderr: Buffer.from('fatal: bad'),
      })
    const exit = spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })
    const consoleError = spyOn(console, 'error').mockImplementation(() => {})

    await expect(main()).rejects.toThrow('exit')

    expect(exit).toHaveBeenCalledWith(1)
    expect(consoleError).toHaveBeenCalledWith('fatal: bad')
    process.argv = originalArgv
  })

  it('when given a ref, diffs that commit against its parent', async () => {
    const originalArgv = process.argv
    process.argv = ['bun', 'x', 'abc']
    const done = Bun.spawnSync(['git', '--version'])
    spyOn(Bun, 'spawnSync')
      .mockReturnValueOnce({ ...done, stdout: Buffer.from('/repo\n') })
      .mockReturnValueOnce({ ...done, stdout: Buffer.from('p1\n') })
      .mockReturnValueOnce({ ...done, stdout: Buffer.from('A\tsrc/b.ts\n') })
    const write = spyOn(Bun, 'write').mockResolvedValue(0)

    await main()

    expect(write).toHaveBeenCalledWith(
      '/repo/docs/review.md',
      'Source:\n\n- new files\n  - [src/b.ts](/src/b.ts#L1)\n- updates\n  - _none_\n',
    )
    process.argv = originalArgv
  })
})
