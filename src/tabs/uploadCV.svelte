<script>
  import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
  import { userCV } from "~lib/stores/userCV";

  async function handleCVUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    GlobalWorkerOptions.workerSrc = await import(
      "pdfjs-dist/build/pdf.worker.entry"
    );

    reader.onload = (e) => ParsePDF(e, userCV.set);
    reader.readAsArrayBuffer(file);
  }

  async function handleDeleteCV() {
    await userCV.set("");
  }

  async function ParsePDF(e, setData) {
    const pdfData = e.target.result;
    const pdf = await getDocument(pdfData).promise;
    const maxPages = 4;
    let extractedText = "";

    try {
      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        extractedText += pageText;
      }
    } catch (error) {
      if (!error.message.includes("Invalid page request."))
        throw new Error(error);
    } finally {
      await setData(extractedText);
      pdf.destroy();
    }
  }
</script>

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
/>

<div>
  <h1>Upload CV</h1>
  {#if $userCV}
    <p>Du kan uploade et nyt CV her..</p>
  {:else}
    <p>Kom igang med at få skræddersyet ansøgninger ved at uploade dit CV</p>
  {/if}

  <form>
    <input type="file" on:change={handleCVUpload} accept=".pdf" />
    {#if $userCV}
      <p>{$userCV.substring(0, 500)}...</p>
      <button type="submit" on:click|preventDefault={handleDeleteCV}>
        Slet CV
      </button>
    {/if}
  </form>
</div>

<style>
  /* Import your CSS or add it directly here */
</style>
