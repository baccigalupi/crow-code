export const isProductionFile = (fileName: string) =>
  /(^|\/)src\/.*\.ts$/.test(fileName) && !fileName.endsWith('.test.ts')

export const isTestFile = (fileName: string) =>
  /(^|\/)tests\/.*\.test\.tsx?$/.test(fileName)

export const isTestSupportFile = (fileName: string) =>
  /(^|\/)tests\/.*\.tsx?$/.test(fileName) && !isTestFile(fileName)

export const isAnySourceFile = (fileName: string) =>
  /(^|\/)src\/.*\.tsx?$/.test(fileName) &&
  !fileName.endsWith('.test.ts') &&
  !fileName.endsWith('.test.tsx')

export const isTsxFile = (fileName: string) =>
  /(^|\/)src\/.*\.tsx$/.test(fileName) && !fileName.endsWith('.test.tsx')

export const isHooksFile = (fileName: string) => /(^|\/)hooks\//.test(fileName)

export const isInstallFile = (fileName: string) =>
  /(^|\/)(src|tests)\/tui\/install\/.*\.tsx?$/.test(fileName)
