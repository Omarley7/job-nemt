<script lang="ts">
  import "~/style.css";
  import DraftDisplay from "~lib/chat_components/draftDisplay.svelte";
  import DraftPreview from "~lib/chat_components/draftPreview.svelte";
  import NoteList from "~lib/chat_components/noteList.svelte";
  import { Storage } from "@plasmohq/storage";
  import { onMount } from "svelte";
  import type { JobApplicationDetails } from "~types";
  import { getPort } from "@plasmohq/messaging/port";

  const localStorageService = new Storage({ area: "local" });
  const openAIport = getPort("openAI");
  let applicationDetails: JobApplicationDetails;

  let postingID: string | null;

  function readIncomingMessage(chunks: [string, string, string]) {
    // loading false
    // if chunks[0, 1 and 2] === "null"
    // -- Append message to applicationDetails.messages
    // -- Close connection to Port.
    // else
    if (chunks) {
      for (let i = 0; i < chunks.length; i++) {
        generatedDrafts[i].draft += chunks[i];
      }
    }
  }

  async function getApplicationDetails(): Promise<JobApplicationDetails> {
    postingID = new URLSearchParams(window.location.search).get("postingID");

    if (!postingID) throw new Error("No postingID found in query params");

    applicationDetails = await localStorageService.get(postingID);

    if (!applicationDetails)
      throw new Error("No application details found in storage");

    return applicationDetails;
  }

  onMount(async () => {
    //chrome.tabs.onRemoved.addListener(removeActiveStatus);
    applicationDetails = await getApplicationDetails();

    // If no messages stored, send prompt to OpenAI. //TODO: Add some loading?
    if (!applicationDetails.messages) {
      console.log("No messages found in storage");
      openAIport.onMessage.addListener(readIncomingMessage);

      openAIport.postMessage({
        body: {
          type: "first draft",
          jobDescription: applicationDetails.jobDescription,
        },
      });
    } else {
      // Show messages
      console.log(applicationDetails.messages);
    }
  });

  let generatedDrafts = [
    { title: "Draft 1", draft: "" },
    { title: "Draft 2", draft: "" },
    { title: "Draft 3", draft: "" },
  ];

  let notes = ["Note 1", "Note 2", "Note 3"];
</script>

<h1 class="jn-text-center jn-text-xl jn-font-bold">Annonce ID: {postingID}</h1>
<div
  class="jn-p-6 custom-grid jn-gap-6
 jn-h-screen jn-items-stretch"
>
  <!-- Top section with cards -->
  {#each generatedDrafts as draft}
    <div class="jn-min-h-32">
      <DraftPreview draft={draft.draft.substring(0, 500)} title={draft.title} />
    </div>
  {/each}

  <div class="jn-col-span-3 jn-h-full">
    <DraftDisplay text={generatedDrafts[0].draft} />
  </div>

  <div class="jn-col-start-4 jn-row-start-1 jn-row-end-3">
    <NoteList {notes} />
  </div>

  <!-- Submit button -->
  <div class="jn-col-span-4 jn-mt-6 jn-h-2">
    <button class="jn-btn jn-btn-primary jn-w-full"> Lav din ansøgning </button>
  </div>
</div>

<style>
  .custom-grid {
    display: grid;
    grid-template-rows: 2fr 4fr 0.75fr;
    grid-template-columns: 1fr 1fr 1fr 30rem;
    /**TODO: Configure xl, lg, md, sm, xs. Need variable last col.*/
  }
</style>
