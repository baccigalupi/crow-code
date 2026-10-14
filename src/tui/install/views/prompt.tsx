import { Box, Text } from 'ink'
import { bufferViewModel } from '../../buffer-view-model.ts'
import type { InputBuffer } from '../../types.ts'

const DefaultValue = ({ input, fallback }: {
  readonly input: InputBuffer
  readonly fallback: string
}) => {
  if (input.text.length !== 0) return null

  return <Text dimColor>({fallback})</Text>
}

type PromptProps = {
  readonly label: string
  readonly input: InputBuffer
  readonly fallback: string
}

export const Prompt = ({ label, input, fallback }: PromptProps) => {
  const { before, cursor, after } = bufferViewModel(input)
  return (
    <Box paddingX={1}>
      <Text wrap='truncate-end'>
        {label}: {before}
        <DefaultValue input={input} fallback={fallback} />
        <Text inverse>{cursor}</Text>
        {after}
      </Text>
    </Box>
  )
}
