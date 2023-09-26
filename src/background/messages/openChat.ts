import { DA_SYSTEM_MESSAGE } from "constants/prompts"
import { createInitialPrompt, type ApiMessage } from "src/services/useOpenAI"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const local_storage = new Storage({ area: "local" })
const sync_storage = new Storage({ area: "sync" })

const goToChat = () => {
  chrome.tabs.create({
    url: "chrome-extension://" + chrome.runtime.id + "/tabs/jobChat.html"
  })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (typeof req.body !== "string") {
    res.send({ error: "invalid_request" })
    console.error("Invalid request body, got:")
    console.error(req.body)
    return
  }

  const api_key = await sync_storage.get("APIKey")
  if (!api_key) {
    res.send({ error: "missing_api_key" })
    return
  }

  const userCV = await local_storage.get("user-cv")
  if (!userCV) {
    res.send({ error: "missing_cv" })
    return
  }

  // Fetch system prompt
  // Generate initial prompt
  const messages: ApiMessage[] = [
    {
      role: "system",
      content: DA_SYSTEM_MESSAGE
    },
    {
      role: "system",
      content: createInitialPrompt(userCV, req.body)
    }
  ]

  // TODO: Prevent opening, if already open
  // Option A - Check if tab is open if possible
  // Option B - Check message history
  await local_storage.set("message-history", messages)

  res.send({ status: "success" })
  goToChat()
  return
}

export default handler
