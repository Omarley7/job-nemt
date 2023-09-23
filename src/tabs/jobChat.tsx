import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css"

import type { MessageModel } from "@chatscope/chat-ui-kit-react"
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { useChadMVP, type ApiMessage } from "~services/useOpenAI"

const TryParseJSON = (jsonString: string) => {
  try {
    // replace [ with \[ to avoid errors
    const prepedJSONstring = jsonString
      .toString()
      .replace("[", "[")
      .replace("]", "]")
    return JSON.parse(prepedJSONstring)
  } catch (e) {
    console.warn("Invalid JSON in system message: ", jsonString)
    console.error(e)
    return jsonString
  }
}

const addMessage = (
  setter: React.Dispatch<React.SetStateAction<MessageModel[]>>,
  message: string,
  direction: "outgoing" | "incoming"
) => {
  setter((prevMessages) => {
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
}

function ChatApp() {
  const [initial_message] = useStorage<ApiMessage>("system-messeages")
  const { sendMessage } = useChadMVP()
  const [messages, setMessages] = useState<MessageModel[]>()
  const [isTyping, setIsTyping] = useState<boolean>(true)

  useEffect(() => {
    if (initial_message) {
      let first_message = TryParseJSON(initial_message.content)
      // If parsing was successful, use the cover letter
      if (first_message?.cover_letter) {
        first_message = first_message.cover_letter
      }
      addMessage(setMessages, first_message, "incoming")
      setIsTyping(false)
    }
  }, [initial_message])

  const handleSend = async (message: string) => {
    setIsTyping(true)

    // Convert previous messages to API format
    const messageHistory: ApiMessage[] = messages.map((m) => {
      return {
        content: m.message,
        role:
          m.sender != "user" && m.sender != "assistant" ? "system" : m.sender
      }
    })

    addMessage(setMessages, message, "outgoing")
    const response = await sendMessage([
      ...messageHistory,
      { content: message, role: "user" }
    ])

    addMessage(setMessages, response, "incoming")
    setIsTyping(false)
  }

  return (
    <div style={{ position: "relative", height: "97vh", width: "100%" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={
              isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null
            }>
            {messages
              ? messages.map((message, i) => (
                  <Message key={i} model={message} />
                ))
              : null}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

export default ChatApp
