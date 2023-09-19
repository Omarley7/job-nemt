import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"

function UploadCVPage() {
  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    GlobalWorkerOptions.workerSrc = await import(
      "pdfjs-dist/build/pdf.worker.entry"
    )

    reader.onload = ParsePDF
    reader.readAsArrayBuffer(file)
  }
  return (
    <div>
      <h1>Upload CV</h1>
      <input type="file" onChange={handleCVUpload} accept=".pdf" />
    </div>
  )
}

export default UploadCVPage

const ParsePDF = async (e: ProgressEvent<FileReader>) => {
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
    console.log(extractedText)
    pdf.destroy()
  }
}
