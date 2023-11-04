import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { JobApplicationDetails } from "~types"

const localStorageService = new Storage({ area: "local" })
const settingsStorageService = new Storage({ area: "sync" })

const openJobChatTab = async (
  applicationDetails: JobApplicationDetails
): Promise<void> => {
  if (applicationDetails.activeTab) {
    try {
      await chrome.tabs.update(applicationDetails.activeTab, { active: true })
      return
    } catch (e) {
      console.error(e)
    }
  }

  await chrome.tabs.create(
    {
      url: `chrome-extension://${chrome.runtime.id}/tabs/jobChat.html?postingID=${applicationDetails.jobPostingID}`
    },
    async (tab) => {
      let storageData: Record<string, JobApplicationDetails> =
        await localStorageService.get("jobApplicationRecords")

      storageData[applicationDetails.jobPostingID].activeTab = tab.id
      await localStorageService.set("jobApplicationRecords", storageData)
    }
  )
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { postingID, jobDescription } = req.body

  if (typeof postingID !== "string" || typeof jobDescription !== "string") {
    res.send({ error: "invalid_request" })
    console.error("Invalid request body, got:", req.body)
    return
  }

  const API_KEY = await settingsStorageService.get("APIkey")
  if (!API_KEY) {
    res.send({ error: "missing_api_key" })
    return
  }

  const userCV = await localStorageService.get("userCV")
  if (!userCV) {
    res.send({ error: "missing_cv" })
    return
  }

  try {
    let applicationDetails = await ensureJobApplicationStored(
      postingID,
      jobDescription
    )
    await openJobChatTab(applicationDetails)
    res.send({})
  } catch (e) {
    console.error("Error ensuring posting ID is stored:", e)
    res.send({ error: "storage_full" })
    return
  }
}

export default handler

async function ensureJobApplicationStored(
  postingID: string,
  jobDescription: string
): Promise<JobApplicationDetails> {
  let storageData: Record<string, JobApplicationDetails> =
    (await localStorageService.get("jobApplicationRecords")) || {}

  if (!storageData[postingID]) {
    storageData[postingID] = {
      jobPostingID: postingID,
      jobDescription,
      initialDrafts: [],
      initialNotes: []
    }
    // Attempt to store the updated data
    await localStorageService.set("jobApplicationRecords", storageData)
  }
  return storageData[postingID]
}
