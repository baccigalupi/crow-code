import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { readdir, readFile, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { GitReadOnlyPassthrough } from '../../../../src/tools/git/read-only/git-passthrough.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('GitReadOnlyPassthrough against the fixture repository', () => {
  // git cannot track a nested .git, so the fixture stores it as dot-git
  beforeEach(async () => {
    await rename(
      resolve('tests/support/fixtures/tools/git/read-only/repo', 'dot-git'),
      resolve('tests/support/fixtures/tools/git/read-only/repo', '.git'),
    )
  })

  afterEach(async () => {
    await rename(
      resolve('tests/support/fixtures/tools/git/read-only/repo', '.git'),
      resolve('tests/support/fixtures/tools/git/read-only/repo', 'dot-git'),
    )
  })

  it('when log runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when log --oneline -n 1 runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '--oneline', '-n', '1'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when show --stat HEAD runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', '--stat', 'HEAD'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when diff runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['diff'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when diff --cached --stat runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['diff', '--cached', '--stat'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when blame --porcelain runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['blame', '--porcelain', '--', 'allowed.txt'],
      },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when status --porcelain=v2 runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when ls-files -o runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['ls-files', '-o', '--exclude-standard'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when ls-tree -r HEAD runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['ls-tree', '-r', 'HEAD'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when rev-parse --show-toplevel runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-parse', '--show-toplevel'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when rev-list --count runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-list', '--count', 'HEAD'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when merge-base runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['merge-base', 'HEAD', 'HEAD'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when name-rev --name-only runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['name-rev', '--name-only', 'HEAD'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when count-objects -v runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['count-objects', '-v'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when show-ref --heads runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show-ref', '--heads'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when for-each-ref --format runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['for-each-ref', '--format=%(refname)'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when cat-file -p runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['cat-file', '-p', 'HEAD'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when check-attr -a runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['check-attr', '-a', 'allowed.txt'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when grep -n runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['grep', '-n', 'allowed'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when branch -a runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['branch', '-a'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when tag -l runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['tag', '-l'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when remote -v runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['remote', '-v'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when config --list runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['config', '--list'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when stash list runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['stash', 'list'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when worktree list runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['worktree', 'list'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when reflog show runs, repository state is unchanged', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const gitDirectory = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      '.git',
    )
    const notesPath = resolve(
      'tests/support/fixtures/tools/git/read-only/repo',
      'notes.txt',
    )
    const statusBefore = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusBefore.run()
    const gitFilesBefore = await readdir(gitDirectory, { recursive: true })
    const notesBefore = await readFile(notesPath, 'utf8')
    const indexPath = resolve(gitDirectory, 'index')
    const indexBefore = await readFile(indexPath)

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['reflog', 'show'] },
    })
    await passthrough.run()
    const statusAfter = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await statusAfter.run()
    const gitFilesAfter = await readdir(gitDirectory, { recursive: true })

    expect(passthrough.success()).toBe(true)
    expect(statusAfter.result()).toEqual(statusBefore.result())
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
    expect(await readFile(indexPath)).toEqual(indexBefore)
  })

  it('when status --porcelain=v2 --untracked-files=all runs, returns typed changes', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })
    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['status', '--porcelain=v2', '--untracked-files=all'],
      },
    })

    await passthrough.run()

    expect(passthrough.result()).toEqual({
      changes: [
        { path: 'notes.txt', index: 'unmodified', worktree: 'modified' },
        {
          path: 'renamed.txt',
          oldPath: 'denied.txt',
          index: 'renamed',
          worktree: 'unmodified',
        },
        { path: 'staged.txt', index: 'added', worktree: 'unmodified' },
        { path: 'untracked.txt', index: 'untracked', worktree: 'untracked' },
      ],
    })
  })
})
