import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (req.body === undefined) {
    return
  }
  chrome.tabs.create({ url: req.body.url })
}

export default handler
