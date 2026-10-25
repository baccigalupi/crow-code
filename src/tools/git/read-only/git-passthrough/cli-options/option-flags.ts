export const gitOptionFlags = (args: string[]) => {
  return args.slice(0, [...args, '--'].indexOf('--'))
}
