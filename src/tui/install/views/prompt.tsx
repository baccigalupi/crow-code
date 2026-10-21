import { Box, Text } from 'ink'
import { bufferViewModel } from '../../buffer-view-model.ts'
import type { InputBuffer } from '../../types.ts'

const DefaultValue = ({
  input,
  defaultValue,
}: {
  readonly input: InputBuffer
  readonly defaultValue: string
}) => {
  if (input.text.length !== 0) return null

  return <Text dimColor>({defaultValue})</Text>
}

type PromptProps = {
  readonly label: string
  readonly input: InputBuffer
  readonly defaultValue: string
}

export const Prompt = ({ label, input, defaultValue }: PromptProps) => {
  const { before, cursor, after } = bufferViewModel(input)
  return (
    <Box paddingX={1}>
      <Text wrap="truncate-end">
        {label}: {before}
        <DefaultValue input={input} defaultValue={defaultValue} />
        <Text inverse>{cursor}</Text>
        {after}
      </Text>
    </Box>
  )
}
