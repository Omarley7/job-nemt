import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

const goToChat = () => {
  chrome.tabs.create({
    url:
      "chrome-extension://" + chrome.runtime.id + "/tabs/applicationChat.html"
  })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (!req.body) {
    return
  }
  storage.set("job-description", req.body)

  const userCV = await storage.get("user-cv")
  if (!userCV) {
    // Watch strategy might not be best approach... Perhaps just return false and let the user click the button again?
    // In that case, storage should be set within this if statement
    storage.watch({
      "user-cv": () => {
        storage.unwatch({ "user-cv": () => {} })
        goToChat()
      }
    })
    res.send({ status: "waiting" })
    return
  }

  goToChat()
  res.send({ status: "success" })
  return
}

export default handler
