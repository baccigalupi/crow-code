import { createInstrumenter } from 'istanbul-lib-instrument'

const parserPlugins = (path: string) => {
  if (path.endsWith('.tsx')) {
    return ['typescript', 'decorators-legacy', 'jsx']
  }

  return ['typescript', 'decorators-legacy']
}

export const instrument = (source: string, path: string) => {
  const options = { esModules: true, parserPlugins: parserPlugins(path) }
  const instrumenter = createInstrumenter(options)
  const code = instrumenter.instrumentSync(source, path)

  return { code, coverage: instrumenter.lastFileCoverage() }
}
