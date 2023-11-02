export interface postingChat {
  postingID: string
  jobDescription: string
  activeTab?: number
  messages?: {
    content: string
    role: string
  }[]
  initialDrafts: string[]
  initialNotes: string[]
}
