import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://job.jobnet.dk/CV/FindWork/Details/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const chatURL =
  "chrome-extension://" + chrome.runtime.id + "/tabs/applicationChat.html"

console.log("Hello from content script")
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
        width: "100vw",
        position: "fixed"
      }}
      className="plasmo-flex plasmo-justify-center plasmo-align-middle">
      {/* TODO: Only show when page is scrolled to top or mouse is hovering over the top of the page */}
      <button
        style={{
          background:
            "right center no-repeat,linear-gradient(#bfd345 25%,#8c9b33)"
        }}
        className="plasmo-text-lg plasmo-p-4 plasmo-rounded-md plasmo-font-bold plasmo-m-2"
        onClick={onApply}>
        Ansøg med JobNemt
      </button>
    </div>
  )
}

export default ApplyButton
