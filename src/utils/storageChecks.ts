import { Storage } from "@plasmohq/storage"

const settingsStorageService = new Storage({ area: "sync" })
const localStorageService = new Storage({ area: "local" })

/**
 * Checks if API key and user CV are present in the storage.
 * @returns A string with the value "missing_api_key" if API key is missing, "missing_cv" if user CV is missing, or void if both are present.
 */
export async function checkAPIkeyAndUserCV(): Promise<string | void> {
  const API_KEY = await settingsStorageService.get("APIkey")
  if (!API_KEY) {
    return "missing_api_key"
  }

  const userCV = await localStorageService.get("userCV")
  if (!userCV) {
    return "missing_cv"
  }
}
