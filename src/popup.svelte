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

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
/>

<div style="width:20rem; padding:1rem">
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
    <button on:click={handleUploadCV} type="submit">Upload CV</button>
  {/if}
</div>

<style>
</style>
