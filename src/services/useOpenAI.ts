import { DA_INITIAL_PROMPT } from "constants/prompts"

import { useStorage } from "@plasmohq/storage/hook"

export interface ApiMessage {
  role: "user" | "system" | "assistant"
  content: string
}

export const createInitialPrompt = (
  cv: string,
  job_description: string
): string => {
  return `${DA_INITIAL_PROMPT} \n *Job beskrivelse:* ${job_description} \n *User resumé: * ${cv}`
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
): Promise<string> => {
  const apiRequestBody = {
    model: "gpt-3.5-turbo",
    messages: messages
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${api_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    })

    // Check if the response status is not in the success range.
    if (!response.ok) {
      // Fetch the error message from the response, or use a default message.
      const errorData = await response.json()
      const errorMessage = errorData?.error?.message || "Unknown error occurred"
      throw new Error(`API Request Failed: ${errorMessage}`)
    }

    const data: ApiResponseBody = await response.json()

    return data.choices[0].message.content
  } catch (error) {
    console.error("Error while posting prompt:", error)
    throw error // Propagate the error, so callers can also handle it if they wish.
  }
}
