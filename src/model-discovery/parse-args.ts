import { Options, SortKey } from './types.js'

const sortKeys: SortKey[] = [
  'coding',
  'reasoning',
  'agentic',
  'cost',
  'context',
]

const defaultOptions = (): Options => {
  return {
    refresh: false,
    sort: 'coding',
    top: 40,
    all: false,
    json: false,
  }
}

const isSortKey = (value: string | undefined): boolean => {
  if (value === undefined) {
    return false
  }
  return sortKeys.includes(value as SortKey)
}

const parseTop = (value: string): number => {
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return 40
  }
  return parsed
}

const applyBooleanFlag = (options: Options, argument: string): boolean => {
  if (argument === '--refresh') {
    options.refresh = true
    return true
  }
  if (argument === '--all') {
    options.all = true
    return true
  }
  if (argument === '--json') {
    options.json = true
    return true
  }
  return false
}

const applyValueFlag = (
  options: Options,
  argument: string,
  value: string | undefined,
): boolean => {
  if (argument === '--filter') {
    if (value !== undefined) {
      options.filter = value
    }
    return true
  }
  if (argument === '--provider') {
    if (value !== undefined) {
      options.provider = value
    }
    return true
  }
  if (argument === '--sort') {
    if (isSortKey(value)) {
      options.sort = value as SortKey
    }
    return true
  }
  if (argument === '--top') {
    if (value !== undefined) {
      options.top = parseTop(value)
    }
    return true
  }
  return false
}

export const parseArguments = (argumentsList: string[]): Options => {
  const options = defaultOptions()
  let index = 0
  while (index < argumentsList.length) {
    const argument = argumentsList[index]
    if (applyBooleanFlag(options, argument)) {
      index++
      continue
    }
    if (applyValueFlag(options, argument, argumentsList[index + 1])) {
      index = index + 2
      continue
    }
    index++
  }
  return options
}
