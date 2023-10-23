import { writable, type Writable } from "svelte/store"

import { Storage } from "@plasmohq/storage"

export const apiKey = createApiKeyStore()

function createApiKeyStore() {
  const { subscribe, set } = writable("")
  const storage = new Storage() // sync storage, add {area: "local"} for local storage

  ;(async () => {
    const value = await storage.get("apiKey")
    set(value || "")
  })()

  async function setApiKey(value: string) {
    await storage.set("apiKey", value)
    set(value)
  }

  return {
    subscribe,
    set: setApiKey
  }
}
