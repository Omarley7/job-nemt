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

import { createInitialPrompt, useChadMVP } from "~services/useOpenAI"

function ChatApp() {
  const [API_KEY] = useStorage("APIKey", "")
  const [jobposting] = useStorage("job-description", "")
  const [cv] = useStorage("user-cv", "")
  const { sendMessage } = useChadMVP(API_KEY)

  const [messages, setMessages] = useState<MessageModel[]>()
  const [isTyping, setIsTyping] = useState<boolean>(true)

  useEffect(() => {
    const init = async () => {
      await sendMessage({
        role: "system",
        content: createInitialPrompt(cv, jobposting)
      }).then((initialMessage) => {
        setMessages([
          {
            direction: "incoming",
            message: initialMessage,
            position: "first",
            sender: "ChatGPT",
            sentTime: "just now"
          }
        ])
        setIsTyping(false)
      })
    }
    init()
  }, [])

  const handleSend = async (message: string) => {
    const newMessage: MessageModel = {
      message,
      direction: "outgoing",
      sender: "user",
      position: "last"
    }

    const newMessages = [...messages, newMessage]

    setMessages(newMessages)
    setIsTyping(true)
    await sendMessage({ role: "user", content: message }).then((response) => {
      const newMessage: MessageModel = {
        message: response,
        direction: "incoming",
        sender: "ChatGPT",
        position: "last"
      }
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)
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
