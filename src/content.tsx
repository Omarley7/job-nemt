import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://job.jobnet.dk/CV/FindWork/Details/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const getJobDescription = () => {
  return document.querySelector("section.job-description-col") as HTMLElement
}

const ApplyButton = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(true)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY > window.innerHeight * 0.3) {
        setIsButtonVisible(false)
      } else {
        setIsButtonVisible(true)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      // Cleanup
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const onApply = async () => {
    const jobDescription = getJobDescription()
    if (jobDescription) {
      const res = await sendToBackground({
        name: "openChat",
        body: { jobDescription }
      })
      if (res?.error == "missing_cv") {
        alert("Du skal uploade dit CV før du kan ansøge med JobNemt")
        sendToBackground({ name: "openCVmanager" })
      }
    } else {
      console.error("No job description found")
    }
  }
  return (
    <>
      {/* TODO: Only show when page is scrolled to top or mouse is hovering over the top of the page */}
      <button
        className={`jn-text-2xl jn-p-4 jn-rounded-md jn-font-bold jn-m-2
      jn-transition-all jn-duration-400 jn-ease-in-out
      jn-fixed -jn-translate-x-1/2 jn-left-1/2 jn-bg-jobnet-green
      hover:jn-bg-jobnet-light-green ${
        !isButtonVisible ? "-jn-translate-y-full" : null
      }`}
        onClick={onApply}>
        Ansøg med JobNemt
      </button>
    </>
  )
}

export default ApplyButton
