import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { postingChat } from "~types"

const local_storage = new Storage({ area: "local" })

function extractJobDescription(): errorResponse | string {
  const jobDescription = document.querySelector(
    "section.job-description-col"
  ) as HTMLElement
  if (!jobDescription) {
    return { message: "No job description found" }
  }
  return jobDescription.innerText
}

export function extractLastPart(url: string): string | null {
  const parts = url.split("/")
  return parts.length > 0 ? parts[parts.length - 1] : null
}

export async function Apply(postingID: string): Promise<{
  errorCode?: string
}> {
  const jobDescription = extractJobDescription()
  if (typeof jobDescription !== "string") {
    return { errorCode: jobDescription.message }
  }

  try {
    await ensurePostingIDisStored(postingID, jobDescription)
  } catch (e) {
    return { errorCode: "storage_full" }
  }

  const res = await sendToBackground({
    name: "openChat",
    body: { postingID }
  })

  return { errorCode: res.error }
}

export interface errorResponse {
  message: string
  action?: () => Promise<void>
}

export function processErrorCode(error: string): errorResponse {
  if (!error) {
    return
  }

  const errorResponse: errorResponse = { message: "" }

  switch (error) {
    case "no_job_description_found":
      errorResponse.message =
        "Jeg kunne ikke finde en jobbeskrivelse på denne side. Prøv en anden..."
      break
    case "missing_cv":
      errorResponse.message =
        "Du skal uploade dit CV før du kan ansøge med JobNemt"
      errorResponse.action = () => sendToBackground({ name: "openCVmanager" })
      break
    case "missing_api_key":
      errorResponse.message =
        "Du skal indtaste din API nøgle før du kan ansøge med JobNemt"
      errorResponse.action = () => sendToBackground({ name: "openSettings" })
      break
    case "invalid_api_key":
      errorResponse.message =
        "Der er er muligvis en fejl med din API nøgle. Prøv at indtaste den igen. Den starter med 'sk-'"
      errorResponse.action = () => sendToBackground({ name: "openSettings" })
      break
    case "storage_full":
      errorResponse.message =
        "Der er ikke plads til flere chats. Purge gamle chats for at fortsætte"
      break
    default:
      console.error(error)
      errorResponse.message = "Der skete en ukendt fejl. Prøv igen senere"
  }
  return errorResponse
}

async function ensurePostingIDisStored(
  postingID: string,
  jobDescription: string
): Promise<void> {
  try {
    let storageData: Record<string, postingChat> =
      (await local_storage.get("postingChats")) || {}
    if (!storageData[postingID]) {
      storageData[postingID] = {
        postingID,
        jobDescription,
        initialDrafts: [],
        initialNotes: []
      }

      // Attempt to store the updated data
      await local_storage.set("postingChats", storageData)
    }
  } catch (e) {
    console.error("Error ensuring posting ID is stored:", e)
    throw e // Re-throw the error to handle it further up the call stack if necessary
  }
}
