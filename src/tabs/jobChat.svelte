<script lang="ts">
  import "~/style.css";
  import DraftDisplay from "~lib/chat_components/draftDisplay.svelte";
  import { scrollToBottom } from "~lib/chat_components/draftDisplay.svelte";
  import DraftPreview from "~lib/chat_components/draftPreview.svelte";
  import NoteList from "~lib/chat_components/noteList.svelte";
  import { Storage } from "@plasmohq/storage";
  import { onMount } from "svelte";
  import type { JobApplicationDetails } from "~types";
  import { getPort } from "@plasmohq/messaging/port";

  const localStorageService = new Storage({ area: "local" });
  const openAIport = getPort("openAI");
  let applicationDetails: JobApplicationDetails;

  let drafts = ["", "", ""];
  let drafting: boolean = false;
  let notes: string[] = [];
  let selectedDraft = 0;
  let postingID: string | null;
  let loading: boolean = true;
  let loadingText = "Loading...";

  async function initialize() {
    applicationDetails = await getApplicationDetails();

    if (!applicationDetails.initialDrafts) {
      openAIport.onMessage.addListener(readIncomingMessage);

      openAIport.postMessage({
        body: {
          type: "first draft",
          jobDescription: applicationDetails.jobDescription,
        },
      });
    } else {
      drafts = applicationDetails.initialDrafts;
      loading = false;
    }
  }

  function readIncomingMessage(
    chunks: [string, string, string] | { error: string } | { DONE: true }
  ) {
    if ("error" in chunks) {
      loadingText = chunks.error;
      return;
    }
    loading = false;
    drafting = true;

    if ("DONE" in chunks) {
      applicationDetails.initialDrafts = drafts;
      localStorageService.set(
        applicationDetails.jobPostingID,
        applicationDetails
      );
      openAIport.disconnect();
      drafting = false;
    }

    if (Array.isArray(chunks)) {
      for (let i = 0; i < chunks.length; i++) {
        drafts[i] += chunks[i];
      }
      scrollToBottom();
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

  onMount(() => {
    initialize();

    return () => {
      openAIport.disconnect();
    };
  });
</script>

{#if loading}
  <div
    class="jn-flex jn-flex-col jn-items-center jn-justify-center jn-h-screen"
  >
    <div class="jn-spinner jn-spinner-primary" />
    <p class="jn-text-center jn-text-lg jn-font-bold jn-mt-4">{loadingText}</p>
  </div>
{/if}

<div
  class="jn-pt-4 jn-pb-4 jn-pl-6 jn-pr-6 custom-grid jn-gap-6 jn-h-screen jn-items-stretch"
>
  <h1 class="jn-text-center jn-text-xl jn-font-bold jn-col-span-full">
    Annonce ID: {postingID}
  </h1>
  {#each drafts as draft, i}
    <div
      class="jn-min-h-32 jn-w-full"
      tabindex="0"
      on:click={() => (selectedDraft = i)}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") selectedDraft = i;
      }}
      role="button"
      aria-label={`Draft ${i + 1}`}
    >
      <DraftPreview
        draft={draft.substring(0, 750)}
        title={`Draft: ${i + 1}`}
        selected={selectedDraft === i}
      />
    </div>
  {/each}

  <div class="jn-col-span-3 jn-h-full">
    <DraftDisplay text={drafts[selectedDraft]} isDisabled={drafting} />
  </div>

  <div class="jn-col-start-4 jn-row-start-2 jn-row-end-4">
    <NoteList {notes} />
  </div>

  <!-- Submit button -->
  <div class="jn-col-span-4 jn-h-2">
    <button class="jn-btn jn-btn-primary jn-w-full"> Lav din ansøgning </button>
  </div>
</div>

<style>
  .custom-grid {
    display: grid;
    grid-template-rows: 1.75rem minmax(12rem, 0.75fr) minmax(4rem, 2fr) 3.2rem;
    grid-template-columns: 1fr 1fr 1fr 25rem;
    /**TODO: Configure xl, lg, md, sm, xs. Need variable last col.*/
  }
</style>
