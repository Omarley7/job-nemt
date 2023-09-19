import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"

import "~style.css"

import { useStorage } from "@plasmohq/storage/hook"

function UploadCVPage() {
  const [userCV, setUserCV] = useStorage("user-cv")

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    GlobalWorkerOptions.workerSrc = await import(
      "pdfjs-dist/build/pdf.worker.entry"
    )

    reader.onload = (e) => ParsePDF(e, setUserCV)
    reader.readAsArrayBuffer(file)
  }

  const handleDeleteCV = async () => {
    await setUserCV("")
  }

  return (
    <div className="jn-flex jn-flex-col jn-items-center jn-space-y-3 jn-font-sans">
      <h1 className="jn-text-2xl jn-font-bold">Upload CV</h1>
      {renderCVMessage(userCV)}
      <form>
        <input type="file" onChange={handleCVUpload} accept=".pdf" />
        {renderCVActions(userCV, handleDeleteCV)}
      </form>
    </div>
  )
}

function renderCVActions(cv: string | undefined, deleteCV: () => void) {
  if (cv === undefined || cv === "") return null
  else {
    return (
      <>
        <button
          type="submit"
          className="jn-px-4 jn-py-2 jn-rounded-lg jn-transition-all jn-border-none
      jn-shadow-lg hover:jn-shadow-md jn-bg-blue-400 hover:jn-bg-blue-300
      jn-text-base jn-font-semibold jn-text-neutral-200 hover:jn-text-neutral-100
      active:jn-scale-105"
          onClick={deleteCV}>
          Slet CV
        </button>
        <p className="jn-text-base jn-italic">Preview af CV kommer snart...</p>
      </>
    )
  }
}

function renderCVMessage(cv: string | undefined) {
  if (cv === undefined || cv === "") {
    return (
      <p className="jn-text-base">
        Kom igang med at få skræddersyet ansøgninger ved at uploade dit CV
      </p>
    )
  } else {
    return <p className="jn-text-base">Du kan uploade et nyt CV her..</p>
  }
}

export default UploadCVPage

const ParsePDF = async (
  e: ProgressEvent<FileReader>,
  setData: (data: string) => Promise<void>
) => {
  const pdfData = e.target.result
  const pdf = await getDocument(pdfData).promise
  const maxPages = 4
  let extractedText = ""

  try {
    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
      extractedText += pageText
    }
  } catch (error) {
    // If PDF is less than 4 pages, it will throw an error, that we can ignore
    if (!error.message.includes("Invalid page request.")) throw new Error(error)
  } finally {
    await setData(extractedText)
    pdf.destroy()
  }
}
