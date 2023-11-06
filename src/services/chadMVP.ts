import { DA_SYSTEM_MESSAGE } from "constants/prompts"

import { Storage } from "@plasmohq/storage"

import type { ApiMessage } from "~services/useOpenAI"

const syncStorageService = new Storage({ area: "sync" })
let API_KEY: string

interface ApiRequestBody {
  model: string
  messages: ApiMessage[]
  stream: boolean
  n?: number
}

// Fetches and verifies the API key
const getVerifiedAPIKey = async () => {
  const API_KEY = await syncStorageService.get("APIkey")
  if (!API_KEY) {
    throw new Error("missing_api_key")
  }
  return API_KEY
}

// Constructs the request body for the API
const constructRequestBody = (request: ApiMessage[]): ApiRequestBody => ({
  model: "gpt-3.5-turbo",
  messages: [{ role: "system", content: DA_SYSTEM_MESSAGE }, ...request],
  stream: true,
  n: 3
})

// Handles the stream reading and processing
const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callback: (result: string[]) => void
) => {
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = new TextDecoder().decode(value)
    parseAndHandleChunk(chunk, callback)
  }
}

// Parses the JSON from the stream and handles the callback invocation
const parseAndHandleChunk = (
  chunk: string,
  callback: (result: string[]) => void
) => {
  const lines = chunk.split("\n\n")
  lines.forEach((line) => {
    if (line.startsWith("data: ") && !line.endsWith("[DONE]")) {
      const content = parseJson(line.slice(6))
      if (content.choices[0]) {
        let response = ["", "", ""]
        response[content.choices[0].index] = content.choices[0].delta.content
        callback(response)
      }
    }
  })
}

// Parses a JSON string and logs errors if any
const parseJson = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return { choices: [{ delta: { content: "" }, index: 0 }] }
  }
}

// Main function to stream applicant drafts
export const streamThreeApplicantDrafts = async (
  request: ApiMessage[],
  callback: (result: string[]) => void
): Promise<string | void> => {
  try {
    API_KEY = await getVerifiedAPIKey()
    const requestBody = constructRequestBody(request)
    const response = await initiateStreamRequest(API_KEY, requestBody)

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("Response body stream is null.")
    }

    await processStream(reader, callback)
  } catch (error: any) {
    console.error("Error:", error)
    return error.message
  }
}

// Initiates the stream request to the API
const initiateStreamRequest = async (
  API_KEY: string,
  requestBody: ApiRequestBody
) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error.message)
  }

  return response
}
