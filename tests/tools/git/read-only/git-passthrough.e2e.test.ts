import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { readdir, readFile, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../../../src/domain/config.ts'
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

  it('when rev-parse --show-toplevel runs, the fixture is its own top level', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-parse', '--show-toplevel'] },
    })
    await passthrough.run()

    expect(passthrough.result().stdout).toEndWith(
      'tests/support/fixtures/tools/git/read-only/repo\n',
    )
  })

  it('when for-each-ref runs, the fixture has one branch at a fixed commit', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['for-each-ref', '--format=%(refname) %(objectname)'],
      },
    })
    await passthrough.run()

    expect(passthrough.result().stdout).toBe(
      'refs/heads/main 7f2203f286226e6c29da25b8edb35b13a7efa7c6\n',
    )
  })

  it('when status runs, the fixture has one modified and one untracked file', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['status', '--porcelain=v2'] },
    })
    await passthrough.run()

    expect(passthrough.result().stdout).toBe(
      '1 .M N... 100644 100644 100644 4e84e5c7a7f85f793bc5a168d6d80daed0df9bb4 4e84e5c7a7f85f793bc5a168d6d80daed0df9bb4 notes.txt\n? untracked.txt\n',
    )
  })

  it('when rev-list --count runs, the fixture has two commits', async () => {
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-list', '--count', 'HEAD'] },
    })
    await passthrough.run()

    expect(passthrough.result().stdout).toBe('2\n')
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
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
    expect(statusAfter.result().stdout).toBe(statusBefore.result().stdout)
    expect(gitFilesAfter).toHaveLength(gitFilesBefore.length)
    expect(gitFilesAfter).toEqual(expect.arrayContaining(gitFilesBefore))
    expect(await readFile(notesPath, 'utf8')).toBe(notesBefore)
  })

  it('when show HEAD:allowed.txt runs with denied.txt ignored, returns the content', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', 'HEAD:allowed.txt'] },
    })
    await passthrough.run()

    expect(passthrough.result().stdout).toBe('allowed two\n')
  })

  it('when show HEAD:denied.txt runs with denied.txt ignored, refuses it', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', 'HEAD:denied.txt'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: denied.txt')
  })

  it('when log -- denied.txt runs with denied.txt ignored, refuses it', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '--', 'denied.txt'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: denied.txt')
  })

  it('when blame --contents denied.txt runs with denied.txt ignored, refuses it', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: resolve('tests/support/fixtures/tools/git/read-only/repo'),
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['blame', '--contents', 'denied.txt', '--', 'allowed.txt'],
      },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: denied.txt')
  })
})
