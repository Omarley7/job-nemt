import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://job.jobnet.dk/CV/FindWork/Details/*"]
}

const chatURL =
  "chrome-extension://" + chrome.runtime.id + "/tabs/applicationChat.html"

// TODO: Only show when page is scrolled to top or mouse is hovering over the top of the page
const ApplyButton = () => {
  const [application, setApplication] = useStorage("application", {})
  const onApply = () => {
    console.log("Applying")
    const jobDescription = document.querySelector(
      "section.job-description-col"
    ) as HTMLElement
    if (jobDescription) {
      setApplication({
        ...application,
        jobDescription: jobDescription.innerText
      })
      console.log(`Going to ${chatURL}`)
      window.open(chatURL, "_blank")
    }
  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        position: "fixed"
      }}>
      <button onClick={onApply}>Ansøg med JobNemt</button>
    </div>
  )
}

export default ApplyButton
