import type { MessageModel } from "@chatscope/chat-ui-kit-react/src/components/Message/Message"
import { useState, type Dispatch } from "react"

export const useChatMessages = () => {
  const [messages, setMessages] = useState<MessageModel[]>()

  const streamResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ) => {
    let response = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.endsWith("[DONE]")) {
            let jsonData = parseJson(line.slice(6))

            response += jsonData.choices[0].delta.content ?? ""
            updateMessage(response, setMessages)
          }
        }
      }
    } catch (error) {
      console.error("Error reading stream:", error)
    }
  }

  const displayMessage = (
    message: string,
    direction: "outgoing" | "incoming"
  ) =>
    setMessages((prevMessages) => {
      if (!prevMessages) {
        return [
          {
            message: message,
            direction: direction,
            sender: direction === "incoming" ? "user" : "assistant",
            position: "first"
          }
        ]
      }
      const updatedMessages = [...prevMessages]

      if (updatedMessages.length > 1) {
        updatedMessages[updatedMessages.length - 1].position = "single"
      }

      updatedMessages.push({
        message: message,
        direction: direction,
        sender: direction === "incoming" ? "user" : "assistant",
        position: "last"
      })
      return updatedMessages
    })

  return [messages, displayMessage, streamResponse] as const
}

const parseJson = (jsonString: string) => {
  let jsonData = { choices: [{ delta: { content: "" } }] }
  try {
    jsonData = JSON.parse(jsonString)
  } catch (error) {
    console.warn("Error parsing JSON: ", error)
    console.warn("JSON: ", jsonString)
  } finally {
    return jsonData
  }
}

const updateMessage = (
  message: string,
  setter: Dispatch<React.SetStateAction<MessageModel[]>>
) => {
  setter((prevMessages) => {
    if (prevMessages && prevMessages.length > 0) {
      const newMessages = [...prevMessages]
      const index = newMessages.length - 1
      newMessages[index] = {
        ...newMessages[index],
        message: message
      }
      return newMessages
    }
    return prevMessages
  })
}
