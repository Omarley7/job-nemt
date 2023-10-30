<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";

  export let notes = [""];
</script>

<CardBody>
  <h2 class="jn-card-title">Keep for draft</h2>
  <ul class="jn-list-decimal pl-5 mt-3 jn-flex-grow">
    {#each notes as note}
      <li class="mb-2">{note}</li>
    {/each}
  </ul>
  <textarea
    class="jn-textarea jn-textarea-sm jn-textarea-secondary
    jn-max-h-32 jn-min-h-12"
    placeholder="Add notes for your draft here... Press enter to add.."
  />
</CardBody>
