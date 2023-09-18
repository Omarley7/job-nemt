import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
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

const ApplyButton = () => {
  const [description, setDescription] = useStorage("job-description", {})

  const onApply = async () => {
    const jobDescription = document.querySelector(
      "section.job-description-col"
    ) as HTMLElement
    if (jobDescription) {
      setDescription(jobDescription.innerText)
      await sendToBackground({
        name: "chat",
        body: { url: chatURL }
      })
    }
  }
  return (
    <>
      {/* TODO: Only show when page is scrolled to top or mouse is hovering over the top of the page */}
      <button
        className="jn-text-2xl jn-p-4 jn-rounded-md jn-font-bold jn-m-2
      jn-transition-all jn-duration-400 jn-ease-in-out
      jn-fixed -jn-translate-x-1/2 jn-left-1/2 jn-bg-jobnet-green
      hover:jn-bg-jobnet-light-green"
        onClick={onApply}>
        Ansøg med JobNemt
      </button>
    </>
  )
}

export default ApplyButton
