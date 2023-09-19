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
    return JSON.parse(jsonString)
  } catch (e) {
    console.warn("Invalid JSON in system message: ", jsonString)
    return jsonString
  }
}

function ChatApp() {
  // const [API_KEY] = useStorage("APIKey")
  const [initial_message] = useStorage<ApiMessage>("system-messeages")
  const { sendMessage } = useChadMVP()
  const [messages, setMessages] = useState<MessageModel[]>()
  const [isTyping, setIsTyping] = useState<boolean>(true)

  useEffect(() => {
    if (initial_message) {
      let first_message = TryParseJSON(initial_message.content)
      setMessages([
        {
          message: first_message.cover_letter
            ? first_message.cover_letter
            : first_message,
          direction: "incoming",
          sender: "ChatGPT",
          position: "first"
        }
      ])
      setIsTyping(false)
    }
  }, [initial_message])

  const handleSend = async (message: string) => {
    setMessages([
      ...messages,
      {
        message,
        direction: "outgoing",
        sender: "user",
        position: "last"
      }
    ])
    setIsTyping(true)

    const messagesToSend: ApiMessage[] = messages.map((m) => {
      return {
        content: m.message,
        role:
          m.sender != "user" && m.sender != "assistant" ? "system" : m.sender
      }
    })

    await sendMessage([
      ...messagesToSend,
      { content: message, role: "user" }
    ]).then((response) => {
      console.log("Msg state before res: ", messages)
      setMessages([
        ...messages,
        {
          message: response,
          direction: "incoming",
          sender: "assistant",
          position: "last"
        }
      ])
      console.log("Msg state after res: ", messages)
      setIsTyping(false)
    })
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
