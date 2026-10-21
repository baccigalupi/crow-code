import { createInstrumenter } from 'istanbul-lib-instrument'

const parserPlugins = (path: string) => {
  if (path.endsWith('.tsx')) {
    return ['typescript', 'decorators-legacy', 'jsx']
  }

  return ['typescript', 'decorators-legacy']
}

export const instrument = (source: string, path: string) => {
  const instrumenter = createInstrumenter({
    esModules: true,
    parserPlugins: parserPlugins(path),
  })
  const code = instrumenter.instrumentSync(source, path)

  return { code, coverage: instrumenter.lastFileCoverage() }
}
