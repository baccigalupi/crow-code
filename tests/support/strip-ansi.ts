const ansiPattern = new RegExp(
  `${String.fromCharCode(27)}\\[[0-9;?]*[a-zA-Z]`,
  'g',
)

// Ink wraps styled text (dimColor, inverse) in ANSI escapes when the test
// output stream is a TTY, which splits contiguous text in lastFrame(). Strip
// the escapes before asserting on rendered content.
export const stripAnsi = (frame: string | undefined) =>
  (frame ?? '').replace(ansiPattern, '')
