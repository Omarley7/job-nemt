import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://job.jobnet.dk/CV/FindWork/Details/*"]
}

// TODO: Only show when page is scrolled to top or mouse is hovering over the top of the page
const ApplyButton = () => {
  const onApply = () => {
    console.log("Applying")
    const jobDescription = document.querySelector(
      "section.job-description-col"
    ) as HTMLElement
    if (jobDescription) {
      console.log(jobDescription.innerText)
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
