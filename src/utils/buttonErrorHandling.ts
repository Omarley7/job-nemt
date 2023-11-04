import { sendToBackground } from "@plasmohq/messaging"

import { ButtonState } from "~types"

export interface errorResponse {
  message: string
  action?: () => Promise<ButtonState>
}

export function processErrorCode(error: string): errorResponse {
  const errorResponse: errorResponse = { message: "" }

  switch (error) {
    case "no_job_description_found":
      errorResponse.message =
        "Jeg kunne ikke finde en jobbeskrivelse på denne side. Prøv en anden..."
      break
    case "missing_cv":
      errorResponse.message =
        "Du skal uploade dit CV før du kan ansøge med JobNemt"
      errorResponse.action = async () => {
        await sendToBackground({ name: "openCVmanager" })
        return ButtonState.READY
      }
      break
    case "missing_api_key":
      errorResponse.message =
        "Du skal indtaste din API nøgle før du kan ansøge med JobNemt"
      errorResponse.action = async () => {
        await sendToBackground({ name: "openSettings" })
        return ButtonState.READY
      }
      break
    case "invalid_api_key":
      errorResponse.message =
        "Der er er muligvis en fejl med din API nøgle. Prøv at indtaste den igen. Den starter med 'sk-'"
      errorResponse.action = async () => {
        await sendToBackground({ name: "openSettings" })
        return ButtonState.READY
      }
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
