export interface JobApplicationDetails {
  jobPostingID: string
  jobDescription: string
  activeTab?: number
  messages?: {
    content: string
    role: string
  }[]
  initialDrafts?: [string, string, string]
  initialNotes: string[]
}

export enum ButtonState {
  READY,
  PROCESSING,
  ALREADY_OPEN,
  ERROR
}
