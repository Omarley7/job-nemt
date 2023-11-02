import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { postingChat } from "~types"

const local_storage = new Storage({ area: "local" })
const sync_storage = new Storage({ area: "sync" })

const goToChat = async (postingID: string): Promise<void> => {
  local_storage.get("postingChats").then(async (storageData) => {
    if (!storageData) {
      throw new Error("No postingChats found in local storage")
    }
    let currentPosting: postingChat = storageData[postingID]
    if (currentPosting.activeTab) {
      try {
        await chrome.tabs.update(currentPosting.activeTab, { active: true })
        return
      } catch (e) {
        console.error(e)
      }
    }

    await chrome.tabs.create(
      {
        url: `chrome-extension://${chrome.runtime.id}/tabs/jobChat.html?postingID=${postingID}`
      },
      async (tab) => {
        storageData[postingID].activeTab = tab.id
        await local_storage.set("postingChats", storageData)
      }
    )
  })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { postingID } = req.body

  if (typeof postingID !== "string") {
    res.send({ error: "invalid_request" })
    console.error("Invalid request body, got:", req.body)
    return
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

  await goToChat(postingID)
  res.send({})
}

export default handler
