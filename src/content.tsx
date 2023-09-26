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

const new_tab_delay_s = 3
const stdButtonText = "Lav en personlig ansøgning med JobNemt!"

function getJobDescription() {
  return document.querySelector("section.job-description-col") as HTMLElement
}

function ApplyButton() {
  const [isButtonVisible, setIsButtonVisible] = useState(false)
  const [isButtonBusy, setIsButtonBusy] = useState(false)
  const [buttonText, setButtonText] = useState(stdButtonText)
  const [countDown, setCountDown] = useState<number>(new_tab_delay_s)

  useEffect(() => {
    ButtonVisibiltyEffect(setIsButtonVisible)
  }, [])

  useEffect(() => {
    setButtonText(
      isButtonBusy ? `Åbner ny fane... (${countDown})` : stdButtonText
    )
  }, [countDown, isButtonBusy])

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
        onClick={() => onApply(setIsButtonBusy, setCountDown)}>
        {buttonText}
      </button>
    </>
  )
}

export default ApplyButton

function ButtonVisibiltyEffect(setVisibility: Function) {
  const handleMouseMove = (e) => {
    if (e.clientY > window.innerHeight * 0.3) {
      setVisibility(false)
    } else {
      setVisibility(true)
    }
  }
  setVisibility(true)

  const timer = setTimeout(() => {
    window.addEventListener("mousemove", handleMouseMove)
  }, 2000)

  return () => {
    clearTimeout(timer)
    window.removeEventListener("mousemove", handleMouseMove)
  }
}

async function onApply(
  setBusy: (busy: boolean) => void,
  setCount: (number) => void
) {
  setBusy(true)
  const jobDescription = getJobDescription()
  if (!jobDescription) {
    console.error("No job description found")
  } else {
    const res = await sendToBackground({
      name: "openChat",
      body: jobDescription.innerText
    })
    if (!res.error) {
      let intervalId
      setInterval(() => {
        setCount((prevCount) => {
          if (prevCount > 0) {
            return prevCount - 1
          } else {
            setBusy(false)
            clearInterval(intervalId)
            return new_tab_delay_s
          }
        })
      }, 1000)
    } else {
      HandleError(res.error)
      setBusy(false)
    }
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
