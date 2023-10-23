<script lang="ts">
  // @ts-check
  import { writable } from "svelte/store";
  import { apiKey } from "~/lib/stores/apiKey";

  let name = writable("");
  let title = writable("");

  let tempAPIkey = "";

  const url = new URL("https://job.jobnet.dk/CV/FindWork");
  url.searchParams.append("SearchString", $name);

  const uploadCVurl = `chrome-extension://${chrome.runtime.id}/tabs/uploadCV.html`;
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
    <input bind:value={$name} placeholder="Navn" type="text" />
    <input bind:value={$title} placeholder="Titel" type="text" />
  {/if}
  <button on:click={() => window.open(uploadCVurl, "_blank")} type="submit"
    >Upload CV</button
  >
</div>

<style>
  /* Coming soon */
</style>
