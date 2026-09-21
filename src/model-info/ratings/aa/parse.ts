import type { AAModel } from '../../types.ts'

export type AAPage = {
  data: AAModel[]
  pagination: { has_more: boolean }
}

const emptyPage = (): AAPage => {
  return { data: [], pagination: { has_more: false } }
}

export const parsePage = async (response: Response): Promise<AAPage> => {
  if (!response.ok) {
    return emptyPage()
  }
  return (await response.json()) as AAPage
}
