import { DA_INITIAL_PROMPT, DA_SYSTEM_MESSAGE } from "constants/prompts"
import {
  createInitialPrompt,
  PostPrompt,
  type ApiMessage
} from "src/services/useOpenAI"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

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

  const api_key = await storage.get("APIKey")
  if (!api_key) {
    res.send({ error: "missing_api_key" })
    return
  }

  const userCV = await storage.get("user-cv")
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

  // Send initial prompt to API
  let response = ""
  try {
    response = await PostPrompt(messages, api_key)
  } catch (e) {
    if (e.message.includes("Invalid API key")) {
      res.send({ error: "invalid_api_key" })
    } else {
      console.error(e)
      res.send({ error: "unknown_error" })
    }
    return
  }

  // Save response to storage and go to chat
  // messages.push({ role: "assistant", content: response })
  await storage.set("system-messeages", { role: "ChatGPT", content: response })

  res.send({ status: "success" })
  setTimeout(() => {
    goToChat()
  }, 2000)
  return
}

export default handler
