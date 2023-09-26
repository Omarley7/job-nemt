import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css"

import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { useChadMVP, type ApiMessage } from "~services/useOpenAI"
import { useChatMessages } from "~tabs/chat_services/messages"

function ChatApp() {
  // Could be "chatHistory" and recide in the useChatMessages hook
  const [message_history, setMessage_history] = useStorage<ApiMessage[]>({
    key: "message-history",
    instance: new Storage({ area: "local" })
  })
  // The sending of messages should be handled by the useChatMessages hook
  const { sendMessage } = useChadMVP()
  // This could be named "messagesToDisplay" to keep it clear that it's not the same as the chatHistory
  const [messages, displayMessage, streamResponse] = useChatMessages()
  const [isTyping, setIsTyping] = useState<boolean>(false)

  useEffect(() => {
    if (message_history && !isTyping) {
      setIsTyping(true)
      ;(async () => {
        const reader = await sendMessage(message_history)
        displayMessage("", "incoming")
        await streamResponse(reader)
        setIsTyping(false)
      })()
    } else {
    }
  }, [message_history])

  const handleSend = async (message: string) => {
    // In the update, this should be as simple as "sendMessage(message)" from the useChatMessages hook
    setMessage_history((prevMessageHistory) => [
      ...prevMessageHistory,
      {
        content: messages[messages.length - 1].message,
        role: "assistant"
      },
      { content: message, role: "user" }
    ])
    displayMessage(message, "outgoing")
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
