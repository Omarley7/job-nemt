import { sendToBackground } from "@plasmohq/messaging"

import type { errorResponse } from "~utils/buttonErrorHandling"

function extractJobDescription(): errorResponse | string {
  const jobDescription = document.querySelector(
    "section.job-description-col"
  ) as HTMLElement
  if (!jobDescription) {
    return { message: "No job description found" }
  }
  return jobDescription.innerText
}

export function extractID(url: string): string {
  const parts = url.split("/")
  const id = parts.length > 0 ? parts[parts.length - 1] : null
  if (!id) {
    throw new Error("No ID found")
  }
  return id
}

export async function applyToJobPosting(postingID: string): Promise<{
  errorCode?: string
}> {
  const jobDescription = extractJobDescription()
  if (typeof jobDescription !== "string") {
    return { errorCode: jobDescription.message }
  }

  const res = await sendToBackground({
    name: "openChat",
    body: { postingID, jobDescription }
  })

  return { errorCode: res.error }
}
