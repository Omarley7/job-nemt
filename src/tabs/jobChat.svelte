<script lang="ts">
  import "~/style.css"

  import { Storage } from "@plasmohq/storage"

  import NoteList from "~lib/chat_components/noteList.svelte"
  import ThreeDrafts from "~lib/threeDrafts.svelte"
  import type { JobApplicationDetails } from "~types"

  // I think we need to add a dispatch error from child to parent
  window.onerror = function (message, source, lineno, colno, error) {
    console.log("Caught error: ", message, source, lineno, colno, error)
    loadingText = "Error: " + message
  }

  // We COULD add a store for this... But no reactivity from local storage
  // Since we don't want to add support between Extension components
  const localStorageService = new Storage({ area: "local" })
  let applicationDetails: JobApplicationDetails

  let notes: string[] = []
  let postingID: string
  let loadingText: string | undefined = "Loading..."

  async function getApplicationDetails(): Promise<JobApplicationDetails> {
    postingID =
      new URLSearchParams(window.location.search).get("postingID") ?? ""

    if (postingID === "") {
      loadingText = "No postingID found in query params"
      throw new Error(loadingText)
    }

    applicationDetails = await localStorageService.get(postingID)

    if (!applicationDetails) {
      loadingText = "No application details found in local storage"
      throw new Error(loadingText)
    }
    loadingText = undefined
    return applicationDetails
  }
</script>

{#if loadingText !== undefined}
  <div
    class="jn-flex jn-flex-col jn-items-center jn-justify-center jn-h-screen">
    <div class="jn-spinner jn-spinner-primary" />
    <p class="jn-text-center jn-text-lg jn-font-bold jn-mt-4">{loadingText}</p>
  </div>
{/if}

<div class="jn-pt-4 jn-pb-4 jn-pl-6 jn-pr-6 custom-grid jn-gap-6 jn-h-screen">
  <h1 class="jn-text-center jn-text-xl jn-font-bold header">
    Annonce ID: {postingID}
  </h1>
  {#await getApplicationDetails() then applicationDetails}
    <ThreeDrafts {applicationDetails} />
  {/await}
  <div class="notes">
    <NoteList {notes} />
  </div>

  <div class="submit-button">
    <button class="jn-btn jn-btn-primary jn-w-full"> Lav din ansøgning </button>
  </div>
</div>

<style>
  .custom-grid {
    display: grid;
    grid-template-rows: 1.75rem minmax(4rem, 2fr) 3.2rem;
    grid-template-columns: 1fr 25rem;
    grid-template-areas:
      "header header"
      ". notes"
      "submit submit";
    /**TODO: Configure xl, lg, md, sm, xs. Need variable last col.*/
  }

  .submit-button {
    grid-area: submit;
  }

  .header {
    grid-area: header;
  }

  .notes {
    grid-area: notes;
  }
</style>
