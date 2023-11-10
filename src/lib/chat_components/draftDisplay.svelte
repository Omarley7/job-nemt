<script lang="ts" context="module">
  let textareaElement: HTMLTextAreaElement;
  export function scrollToBottom() {
    textareaElement.scrollTop = textareaElement.scrollHeight;
  }
</script>

<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";

  export let text = "";
  export let isDisabled = false;
</script>

<CardBody>
  <textarea
    bind:this={textareaElement}
    class="jn-textarea jn-textarea-lg jn-textarea-primary jn-h-full"
    placeholder="the full text of the draft will be displayed here"
    disabled={isDisabled}
  >
    {text}
  </textarea>
</CardBody>
