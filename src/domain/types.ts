export type ProviderRecord = {
  id: number
  name: string
  base_url: string
  models_path: string | null
  api_key_env_var: string | null
}
export type EmptyRecord = Record<string, never>
