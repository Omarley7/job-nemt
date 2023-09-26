import { useStorage } from "@plasmohq/storage/hook"

export interface ApiMessage {
  role: "user" | "system" | "assistant"
  content: string
}

export const createInitialPrompt = (
  cv: string,
  job_description: string
): string => {
  return `*Job beskrivelse:* ${job_description} \n *User resumé: * ${cv}`
}

/** Send a message to the API and returns the latest message.
 * TODO: Should handle error handling on a resposonse level here
 *
 * @param param0
 * @returns
 */
export const useChadMVP = () => {
  const [API_KEY] = useStorage("APIKey")

  const sendMessage = async (messages: ApiMessage[]) => {
    const response = await PostPrompt(messages, API_KEY)
    return response
  }

  return { sendMessage }
}

export interface ApiResponseBody {
  choices: { message: { content: string } }[]
  model: string
}

interface apiRequestBody {
  model: string
  messages: ApiMessage[]
  stream: boolean
}

/** Send a message to the API and returns the latest message.
 * TODO: Should include error handling on a network level
 *
 * @param messages
 * @param api_key
 * @returns
 */
export const PostPrompt = async (
  messages: ApiMessage[],
  api_key: string
): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  const body: apiRequestBody = {
    model: "gpt-3.5-turbo",
    messages: messages, //[{ content: "hi", role: "user" }]
    stream: true
  }
  // return "hi" -- For testing
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error(`Fetch returned: ${response.status}`)
    console.error(errorData.error.message)
    throw new Error(
      errorData.error.code === "invalid_api_key"
        ? "Invalid API key"
        : "Unknown error occurred"
    ) // This is bullshit
  }

  return response.body!.getReader()
}
