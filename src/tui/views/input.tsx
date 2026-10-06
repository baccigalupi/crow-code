import { Box, Text } from 'ink'
import type { InputBuffer, InputViewModelArguments } from '../types.ts'
import { bufferViewModel } from './buffer-view-model.ts'
import { inputViewModel } from './input-view-model.ts'

const Placeholder = ({ isEmpty }: { readonly isEmpty: boolean }) => {
  if (!isEmpty) return null

  return <Text dimColor>type a message</Text>
}

const Buffer = ({ buffer }: { readonly buffer: InputBuffer }) => {
  const { before, cursor, after } = bufferViewModel(buffer)
  return (
    <>
      {before}
      <Text inverse>{cursor}</Text>
      {after}
    </>
  )
}

export const Input = (props: InputViewModelArguments) => {
  const { rowHeight, buffer, isEmpty } = inputViewModel(props)
  return (
    <Box height={rowHeight}>
      <Text wrap='wrap'>
        <Placeholder isEmpty={isEmpty} />
        <Buffer buffer={buffer} />
      </Text>
    </Box>
  )
}
