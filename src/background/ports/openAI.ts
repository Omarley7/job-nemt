import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { streamThreeApplicantDrafts } from "~services/chadMVP"

const localStorageService = new Storage({ area: "local" })

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { type, jobDescription } = req.body as {
    type: string
    jobDescription: string
  }

  if (typeof type !== "string" && typeof jobDescription !== "string") {
    throw new Error("Invalid request body, got:", req.body)
  }

  if (type !== "first draft") {
    res.send({ error: "Invalid request type" })
    return
  }

  // Callback funciton to send chunks of data to the client
  const sendChunks = (chunks: string[]) => {
    res.send(chunks)
  }

  // There's a very very small chance normal chunk could send [DONE] as a chunk
  const sendFinishSignal = () => {
    res.send({ DONE: true })
  }

  const userCV = await localStorageService.get("userCV")
  const errorMessage = await streamThreeApplicantDrafts(
    [
      {
        role: "user",
        content: `*Job beskrivelse:* ${jobDescription} \n *User resumé: * ${userCV}`
      }
    ],
    sendChunks,
    sendFinishSignal
  )

  if (errorMessage) {
    res.send({ error: errorMessage })
  }
}

export default handler
