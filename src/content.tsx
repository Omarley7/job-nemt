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
  const [buttonText, setButtonText] = useState("Ansøg med JobNemt")

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
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const working = () => {
    setIsButtonBusy(true)
    setButtonText("Skriver ansøgning baseret på dit CV...")
  }

  const done = (res) => {
    if (res?.error) {
      HandleError(res.error)
    } else {
      setButtonText("Done!")
      setTimeout(() => {
        setButtonText("Ansøg med JobNemt")
      }, 3000)
    }
    setIsButtonBusy(false)
  }

  return (
    <>
      <button
        disabled={isButtonBusy}
        className={`jn-text-2xl jn-p-4 jn-rounded-md jn-font-bold jn-m-2
      jn-transition-all jn-duration-400 jn-ease-in-out
      disabled:jn-opacity-80 disabled:jn-cursor-wait 
      jn-fixed -jn-translate-x-1/2 jn-left-1/2 jn-bg-jobnet-green
      ${!isButtonBusy ? "hover:jn-bg-jobnet-light-green" : null}
      ${!isButtonVisible ? "-jn-translate-y-full" : null}`}
        onClick={() => onApply(working, done)}>
        {buttonText}
      </button>
    </>
  )
}

export default ApplyButton

const onApply = async (handleWorking: Function, handleDone: Function) => {
  const jobDescription = getJobDescription()
  if (jobDescription) {
    handleWorking()
    const res = await sendToBackground({
      name: "openChat",
      body: jobDescription.innerText
    })
    handleDone()
  } else {
    console.error("No job description found")
  }
}

function HandleError(error: string) {
  if (error === "missing_cv") {
    alert("Du skal uploade dit CV før du kan ansøge med JobNemt")
    sendToBackground({ name: "openCVmanager" })
  } else if (error === "missing_api_key") {
    alert("Du skal indtaste din API nøgle før du kan ansøge med JobNemt")
    sendToBackground({ name: "openSettings" })
  } else if (error === "invalid_api_key") {
    alert(
      "Der er er muligvis en fejl med din API nøgle. Prøv at indtaste den igen. Den starter med 'sk-'"
    )
    sendToBackground({ name: "openSettings" })
  } else {
    console.error(error)
    alert("Der skete en ukendt fejl. Prøv igen senere")
  }
}
