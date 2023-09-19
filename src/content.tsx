import { TIMEOUT } from "dns"
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
  const [isButtonBusy, setIsButtonBusy] = useState(false)
  let btnText = "Ansøg med JobNemt"

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
      setIsButtonBusy(true)
      const res = await sendToBackground({
        name: "openChat",
        body: jobDescription.innerText
      })
      if (res?.error == "missing_cv") {
        alert("Du skal uploade dit CV før du kan ansøge med JobNemt")
        sendToBackground({ name: "openCVmanager" })
      }
      setIsButtonBusy(false)
      btnText = "Done!"
      setTimeout(() => {
        btnText = "Ansøg med JobNemt"
      }, 3000)
    } else {
      console.error("No job description found")
    }
  }
  return (
    <>
      {/* isButtonBusy ? (
        <div
          className="jn-fixed jn-top-0 jn-left-0 jn-w-screen jn-h-screen
        jn-bg-black jn-opacity-50 jn-z-50
        jn-cursor-progress
        "></div>
      ) : null*/}
      <button
        disabled={isButtonBusy}
        className={`jn-text-2xl jn-p-4 jn-rounded-md jn-font-bold jn-m-2
      jn-transition-all jn-duration-400 jn-ease-in-out
      disabled:jn-opacity-80 disabled:jn-cursor-wait 
      jn-fixed -jn-translate-x-1/2 jn-left-1/2 jn-bg-jobnet-green
      ${!isButtonBusy ? "hover:jn-bg-jobnet-light-green" : null}
      ${!isButtonVisible ? "-jn-translate-y-full" : null}`}
        onClick={onApply}>
        {isButtonBusy ? "Skriver ansøgning baseret på dit CV..." : btnText}
      </button>
    </>
  )
}

export default ApplyButton
