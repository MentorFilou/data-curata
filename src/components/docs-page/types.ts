export type NavFile = { type: 'file'; key: string }
export type NavFolder = {
  type: 'folder'
  name: string
  path: string
  indexKey: string | null
  children: NavNode[]
}
export type NavNode = NavFile | NavFolder
