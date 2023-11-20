<script lang="ts" context="module">
  import DraftDisplay, {
    throttleScrollToBottom,
  } from "~lib/chat_components/draftDisplay.svelte";
  import DraftPreview from "~lib/chat_components/draftPreview.svelte";
  //TODO: Update to only scroll to bottom when the user is at the bottom of the textarea
  //Enable when onscroll shows user is a bottom
  //Disable when user scrolls up
  export const scrollToBottom = throttleScrollToBottom;
</script>

<script lang="ts">
  import { getPort } from "@plasmohq/messaging/port";
  import { Storage } from "@plasmohq/storage";
  import type { JobApplicationDetails } from "~types";
  import { onMount } from "svelte";

  export let applicationDetails: JobApplicationDetails;
  console.log(applicationDetails);
  let drafting: boolean;
  let drafts: [string, string, string] = ["", "", ""];
  let postingID: string;

  let selectedDraft = 0;
  const localStorageService = new Storage({ area: "local" });
  const openAIport = getPort("openAI");

  onMount(() => {
    postingID = applicationDetails.jobPostingID;
    if (!applicationDetails.initialDrafts) {
      openAIport.onMessage.addListener(readThreeDrafts);

      openAIport.postMessage({
        body: {
          type: "first draft",
          jobDescription: applicationDetails.jobDescription,
        },
      });
    } else {
      drafts = applicationDetails.initialDrafts;
      drafting = false;
    }
    return () => {
      openAIport.disconnect();
    };
  });

  function readThreeDrafts(
    chunks: [string, string, string] | { error: string } | { DONE: true }
  ) {
    if ("error" in chunks) throw new Error(chunks.error);

    // loadingText = undefined;
    drafting = true;

    if ("DONE" in chunks) {
      applicationDetails.initialDrafts = drafts;
      localStorageService.set(postingID, applicationDetails);
      openAIport.disconnect();
      drafting = false;
    }

    if (Array.isArray(chunks)) {
      for (let i = 0; i < chunks.length; i++) {
        drafts[i] += chunks[i];
      }
      scrollToBottom(); //Could be moved to component.
    }
  }
</script>

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
