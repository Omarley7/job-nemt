<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";

  export let text = "";
</script>

<CardBody>
  <textarea
    class="jn-textarea jn-textarea-lg jn-textarea-primary jn-h-full"
    placeholder="the full text of the draft will be displayed here"
    disabled
  >
    {text}
  </textarea>
</CardBody>
