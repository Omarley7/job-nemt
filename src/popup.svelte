<script lang="ts">
  // @ts-check
  import { writable } from "svelte/store";
  import { apiKey } from "~/lib/stores/apiKey";

  let name = writable(""); //TODO: these two should be in a single object and in storage
  let title = writable("");

  let tempAPIkey = "";

  function handleJobSearch() {
    const url = new URL("https://job.jobnet.dk/CV/FindWork");
    url.searchParams.append("SearchString", $title);
    chrome.tabs.create({ url: url.toString() });
  }

  function handleUploadCV() {
    const uploadCVpage = `chrome-extension://${chrome.runtime.id}/tabs/uploadCV.html`;
    chrome.tabs.create({ url: uploadCVpage });
  }
</script>

<div>
  {#if $apiKey === ""}
    <h1>Indsæt din OpenAI API nøgle</h1>
    <input
      bind:value={tempAPIkey}
      placeholder="API nøgle"
      type="password"
      on:blur={() => {
        apiKey.set(tempAPIkey);
      }}
    />
  {:else}
    <form>
      <input bind:value={$name} placeholder="Navn" type="text" />
      <input bind:value={$title} placeholder="Titel" type="text" />
      <button on:click={handleJobSearch} type="submit"> Find job </button>
    </form>
  {/if}
  <button on:click={handleUploadCV} type="submit">Upload CV</button>
</div>

<style>
  /* Coming soon */
</style>
