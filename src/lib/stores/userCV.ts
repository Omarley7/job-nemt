import { writable, type Writable } from "svelte/store"

import { Storage } from "@plasmohq/storage"

export const userCV = createUserCVStore()

function createUserCVStore() {
  const { subscribe, set } = writable("")
  const storage = new Storage({ area: "local" })

  ;(async () => {
    const value = await storage.get("userCV")
    set(value || "")
  })()

  async function setUserCV(value: string) {
    await storage.set("userCV", value)
    set(value)
  }

  return {
    subscribe,
    set: setUserCV
  }
}
