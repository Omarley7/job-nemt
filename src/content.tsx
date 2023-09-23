import { new_tab_delay_s } from "constants/delays"
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
  const [isButtonVisible, setIsButtonVisible] = useState(false)
  const [isButtonBusy, setIsButtonBusy] = useState(false)
  const [taskDone, setTaskDone] = useState(false)
  const [buttonText, setButtonText] = useState("Ansøg med JobNemt")
  const [countDown, setCountDown] = useState<number>(new_tab_delay_s)

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

  useEffect(() => {
    if (taskDone) {
      setButtonText(`Done! (${countDown})`)
    } else {
      setButtonText("Ansøg med JobNemt")
      setIsButtonBusy(false)
    }
  }, [countDown])

  const working = () => {
    setIsButtonBusy(true)
    setButtonText(
      "Skriver ansøgning baseret på dit CV og stillingen. Det kan tage op til 2 minutter. En ny fane åbner automatisk, du kan forsætte dit arbejde i mellemtiden. (Du kan godt lukke denne fane)"
    )
  }

  const done = (res) => {
    if (res?.error) {
      HandleError(res.error)
    } else {
      setTaskDone(true)
      setButtonText(`Done! (${countDown})`) // Update buttonText immediately
      let intervalId
      setInterval(() => {
        setCountDown((prevCount) => {
          if (prevCount > 0) {
            return prevCount - 1
          } else {
            setTaskDone(false)
            clearInterval(intervalId)
            return new_tab_delay_s
          }
        })
      }, 1000)
    }
  }

  return (
    <>
      <button
        disabled={isButtonBusy}
        className={`
          jn-text-2xl jn-p-4 jn-rounded-md jn-font-bold jn-m-2
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
  console.log(error)
  switch (error) {
    case "missing_cv":
      alert("Du skal uploade dit CV før du kan ansøge med JobNemt")
      sendToBackground({ name: "openCVmanager" })
      break
    case "missing_api_key":
      alert("Du skal indtaste din API nøgle før du kan ansøge med JobNemt")
      sendToBackground({ name: "openSettings" })
      break
    case "invalid_api_key":
      alert(
        "Der er er muligvis en fejl med din API nøgle. Prøv at indtaste den igen. Den starter med 'sk-'"
      )
      sendToBackground({ name: "openSettings" })
      break
    default:
      console.error(error)
      alert("Der skete en ukendt fejl. Prøv igen senere")
  }
}
