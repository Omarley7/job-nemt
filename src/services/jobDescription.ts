import { sendToBackground } from "@plasmohq/messaging"

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
  success: boolean
  tabIndex?: number
  data?: string
}> {
  const jobDescription = extractJobDescription()
  if (typeof jobDescription !== "string") {
    return { success: false, data: jobDescription.message }
  }

  const res = await sendToBackground({
    name: "openChat",
    body: { postingID, jobDescription }
  })

  return { success: !res.error, data: res.error }
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
    default:
      console.error(error)
      errorResponse.message = "Der skete en ukendt fejl. Prøv igen senere"
  }
  return errorResponse
}
