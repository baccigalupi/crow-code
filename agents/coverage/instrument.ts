import { createInstrumenter } from 'istanbul-lib-instrument'

export const instrument = (
  source: string,
  path: string,
  inputSourceMap: object | undefined,
) => {
  const instrumenter = createInstrumenter({ esModules: true, produceSourceMap: true })
  const code = instrumenter.instrumentSync(source, path, inputSourceMap)

  return { code, coverage: instrumenter.lastFileCoverage() }
}
