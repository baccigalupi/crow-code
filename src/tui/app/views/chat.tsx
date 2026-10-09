import { Box, Text } from 'ink'
import type { ChatViewModelArguments, HistoryEntry } from '../types.ts'
import { chatViewModel } from './chat-view-model.ts'

const HistoryLine = ({ entry }: { readonly entry: HistoryEntry }) => (
  <Text wrap='wrap'>{entry.text}</Text>
)

export const Chat = (props: ChatViewModelArguments) => {
  const { histories } = chatViewModel(props)
  return (
    <Box
      flexDirection='column'
      flexGrow={1}
      justifyContent='flex-end'
      overflow='hidden'
    >
      {histories.map((entry) => <HistoryLine key={entry.id} entry={entry} />)}
    </Box>
  )
}
