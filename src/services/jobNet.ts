import type { errorResponse } from "~utils/buttonErrorHandling"

export function extractJobDescription(): errorResponse | string {
  const jobDescription = document.querySelector(
    "section.job-description-col"
  ) as HTMLElement
  if (!jobDescription) {
    return { message: "No job description found" }
  }
  return jobDescription.innerText
}

//TODO: Prefix with jobNet for storageID. This is to avoid conflicts with other services
export function extractID(url: string): string {
  const parts = url.split("/")
  const id = parts.length > 0 ? parts[parts.length - 1] : null
  if (!id) {
    throw new Error("No ID found")
  }
  return id
}
