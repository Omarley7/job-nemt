import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.tabs.create({
    url: "chrome-extension://" + chrome.runtime.id + "/options.html"
  })
  res.send({ status: "success" })
  return
}

export default handler
