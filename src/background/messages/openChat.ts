import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { JobApplicationDetails } from "~types"
import { checkAPIkeyAndUserCV } from "~utils/storageChecks"

const localStorageService = new Storage({ area: "local" })

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

  const ID = applicationDetails.jobPostingID
  await chrome.tabs.create(
    {
      url: `chrome-extension://${chrome.runtime.id}/tabs/jobChat.html?postingID=${ID}`
    },
    async (tab) => {
      applicationDetails.activeTab = tab.id
      await localStorageService.set(ID, applicationDetails)
    }
  )
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { postingID, jobDescription } = req.body as {
    postingID: string
    jobDescription: string
  }

  if (typeof postingID !== "string" || typeof jobDescription !== "string") {
    res.send({ error: "invalid_request" })
    console.error("Invalid request body, got:", req.body)
    return
  }

  const error_code = await checkAPIkeyAndUserCV()
  if (error_code) return res.send({ error: error_code })

  try {
    // This step might be redundant now 🤔
    let applicationDetails = await ensureJobApplicationStored(
      postingID,
      jobDescription
    )
    await openJobChatTab(applicationDetails)
    return res.send({})
  } catch (e) {
    console.error("Error ensuring posting ID is stored:", e)
    return res.send({ error: "storage_full" })
  }
}

export default handler

async function ensureJobApplicationStored(
  postingID: string,
  jobDescription: string
): Promise<JobApplicationDetails> {
  let applicationDetails: JobApplicationDetails | void =
    await localStorageService.get(postingID)

  if (!applicationDetails) {
    applicationDetails = {
      jobPostingID: postingID,
      jobDescription,
      initialDrafts: [],
      initialNotes: []
    }
    // Attempt to store the updated data
    await localStorageService.set(postingID, applicationDetails)
  }
  return applicationDetails
}
