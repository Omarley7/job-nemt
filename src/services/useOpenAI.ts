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
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
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
  const apiRequestBody: { model: string; messages: ApiMessage[] } = {
    model: "gpt-3.5-turbo",
    messages: messages //[{ content: "hi", role: "user" }]
  }
  // return "hi" -- For testing

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(apiRequestBody)
  })

  if (response.ok) {
    const data: ApiResponseBody = await response.json()
    printPrice(data)
    return data.choices[0].message.content
  }

  const errorData = await response.json()
  if (response.status === 401) {
    console.error(`Fetch returned: 401`)
    console.error(errorData.error.message)
    if (errorData.error.code === "invalid_api_key") {
      throw new Error("Invalid API key")
    } else {
      throw new Error("Unknown error occurred")
    }
  }
}

const printPrice = (data: ApiResponseBody) => {
  const input_token_price =
    (data.model.includes("gpt-4") ? 0.03 : 0.0015) / 1000
  const output_token_price =
    (data.model.includes("gpt-4") ? 0.06 : 0.002) / 1000
  const prompt_price = input_token_price * data.usage.prompt_tokens
  const completion_price = output_token_price * data.usage.completion_tokens

  console.info([
    {
      "Prompt price USD": prompt_price,
      "Completion price USD": completion_price,
      "Total in USD": prompt_price + completion_price,
      "Total in DKK": (prompt_price + completion_price) * 7,
      Model: data.model
    }
  ])
}
