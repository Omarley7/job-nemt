import { useState } from "react"

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css"

import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react"
import type { MessageModel } from "@chatscope/chat-ui-kit-react"

import { useStorage } from "@plasmohq/storage/hook"

type MessageRole = "system" | "user" | "assistant"

interface ApiMessage {
  role: MessageRole
  content: string
}

interface ApiResponseBody {
  choices: { message: { content: string } }[]
}

const systemMessage: ApiMessage = {
  role: "system",
  content:
    "You are a helpful assistant that helps finding the best job titles for a candidate based on a CV or summray of a CV. After the user sends you the text, you'll respond with a single job title that you find to be the best fit."
}

function ChatApp() {
  const [API_KEY] = useStorage("APIKey", "")
  const [jobposting] = useStorage("job-description", "")

  const jobpostingMessage: ApiMessage = {
    role: "user",
    content: jobposting
  }

  const CVmessage: ApiMessage = {
    role: "user",
    content: "Jeg er en dygtig programmør, der søger et job som programmør."
  }

  // This needs to be changed to an reaction to the first draft from ChatGPT.
  const [messages, setMessages] = useState<MessageModel[]>([
    {
      message: "Lad mig høre om du vil have nogle ændringer i din ansøgning?",
      sentTime: "just now",
      sender: "ChatGPT",
      direction: "incoming",
      position: "first"
    }
  ])
  const [isTyping, setIsTyping] = useState<boolean>(false)

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
    await processMessageToChatGPT(newMessages)
  }

  async function processMessageToChatGPT(chatMessages: MessageModel[]) {
    let apiMessages: ApiMessage[] = chatMessages.map((messageObject) => {
      let role: MessageRole =
        messageObject.sender === "ChatGPT" ? "assistant" : "user"
      return { role, content: messageObject.message }
    })

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, jobpostingMessage, CVmessage, ...apiMessages]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    })
      .then((data) => {
        return data.json()
      })
      .then((data: ApiResponseBody) => {
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming",
            position: "last"
          }
        ])
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
            {messages.map((message, i) => {
              return <Message key={i} model={message} />
            })}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

export default ChatApp
