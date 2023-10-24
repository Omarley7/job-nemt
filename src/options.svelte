<script lang="ts">
  import { apiKey } from "~lib/stores/apiKey";

  let tempAPIkey = "";
  apiKey.subscribe((value) => {
    tempAPIkey = value;
  });
</script>

<div>
  <h1>Indsæt din openAI API nøgle for at bruge denne chrome-extension</h1>
  <input
    type=""
    bind:value={tempAPIkey}
    placeholder="API nøgle"
    on:blur={() => {
      apiKey.set(tempAPIkey);
    }}
  />
</div>

<!-- TODO: Insert API key check -->
