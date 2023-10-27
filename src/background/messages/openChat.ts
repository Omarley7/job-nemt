import { DA_SYSTEM_MESSAGE } from "constants/prompts"
import { createInitialPrompt, type ApiMessage } from "src/services/useOpenAI"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

export interface OpenChatRequest {
  postingID: string
  jobDescription?: string
}

const local_storage = new Storage({ area: "local" })
const sync_storage = new Storage({ area: "sync" })
const tab_ids: { [key: string]: number } = {}

const goToChat = async (postingID: string) => {
  let tab = await chrome.tabs.create({
    url: "chrome-extension://" + chrome.runtime.id + "/tabs/jobChat.html"
  })
  tab_ids[postingID] = tab.id
  console.log("tab_ids", tab_ids)

  return
}

const isTabOpen = async (postingID: string) => {
  return new Promise<boolean>((resolve) => {
    chrome.tabs.get(tab_ids[postingID], (tab) => {
      if (!tab) {
        delete tab_ids[postingID]
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { postingID, jobDescription } = req.body as OpenChatRequest

  if (typeof postingID !== "string") {
    res.send({ error: "invalid_request" })
    console.error("Invalid request body, got:", req.body)
    return
  }

  if (typeof jobDescription !== "string") {
    let tabIsOpen = await isTabOpen(postingID)
    res.send({ chatExists: tabIsOpen })
    if (tabIsOpen) {
      chrome.tabs.update(tab_ids[postingID], { active: true })
    }
  }

  const api_key = await sync_storage.get("APIkey")
  if (!api_key) {
    res.send({ error: "missing_api_key" })
    return
  }

  const userCV = await local_storage.get("userCV")
  if (!userCV) {
    res.send({ error: "missing_cv" })
    return
  }

  //Use Posting ID to create a new chat
  const messages: ApiMessage[] = [
    { role: "system", content: DA_SYSTEM_MESSAGE },
    { role: "system", content: createInitialPrompt(userCV, jobDescription) }
  ]

  await local_storage.set("message-history", messages)
  goToChat(postingID)
  res.send({ chatExists: true })
}

export default handler
