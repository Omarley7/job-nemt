<script lang="ts">
  import "~/style.css";
  import DraftDisplay from "~lib/chat_components/draftDisplay.svelte";
  import DraftPreview from "~lib/chat_components/draftPreview.svelte";
  import NoteList from "~lib/chat_components/noteList.svelte";
  import { Storage } from "@plasmohq/storage";
  import { onMount } from "svelte";
  import type { JobApplicationDetails } from "~types";

  const local_storage = new Storage({ area: "local" });
  let postingChat: JobApplicationDetails;

  let postingID = "";

  async function removeActiveStatus(tabID: number): Promise<void> {
    if (tabID === postingChat.activeTab) {
      delete postingChat.activeTab;
      local_storage.get(`postingChats`).then(async (storagedata) => {
        storagedata[postingID] = postingChat;
        await local_storage.set(`postingChats`, storagedata);
      });
    }
  }

  onMount(() => {
    chrome.tabs.onRemoved.addListener(removeActiveStatus);

    const queryParams = new URLSearchParams(window.location.search);
    postingID = queryParams.get("postingID");

    local_storage.get(`postingChats`).then((storagedata) => {
      postingChat = storagedata[postingID];
    });

    return () => {
      chrome.tabs.onRemoved.removeListener(removeActiveStatus);
    };
  });

  let generatedDrafts = [
    {
      title: "Draft 1",
      draft: "Text coming soon",
    },
    {
      title: "Draft 2",
      draft: "Text coming soon",
    },
    {
      title: "Draft 3",
      draft: "Text coming soon",
    },
  ];

  let notes = ["Note 1", "Note 2", "Note 3"];
</script>

<div
  class="jn-p-6 custom-grid jn-gap-6
 jn-h-screen jn-items-stretch"
>
  <!-- Top section with cards -->
  {#each generatedDrafts as draft}
    <div class="jn-min-h-32">
      <DraftPreview draft={draft.draft} title={draft.title} />
    </div>
  {/each}

  <div class="jn-col-span-3 jn-h-full">
    <DraftDisplay />
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
