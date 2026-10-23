import type { StepValues } from '../../types.ts'

type ConfirmPromptViewModelArguments = Pick<StepValues, 'confirmation'>

const options = [
  { name: 'Yes', description: '' },
  { name: 'No', description: '' },
]

export const confirmPromptViewModel = ({
  confirmation,
}: ConfirmPromptViewModelArguments) => {
  if (confirmation) return { options, selectedIndex: 0 }

  return { options, selectedIndex: 1 }
}
