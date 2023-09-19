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
    res.send({ error: "missing_cv" })
    return
  }

  goToChat()
  res.send({ status: "success" })
  return
}

export default handler
