<script lang="ts" context="module">
  import { throttle } from "~utils/rateLimit"

  let textareaElement: HTMLTextAreaElement
  export const throttleScrollToBottom = throttle(scrollToBottom, 500)
  export function scrollToBottom() {
    textareaElement.scrollTo({
      top: textareaElement.scrollHeight,
      behavior: "smooth"
    })
  }
</script>

<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte"

  export let text: string
  export let isDisabled = false
</script>

<CardBody>
  <textarea
    bind:this={textareaElement}
    style="resize: none;"
    class="jn-textarea jn-textarea-lg jn-textarea-primary jn-h-full"
    placeholder="the full text of the draft will be displayed here"
    disabled={isDisabled}>
    {text}
  </textarea>
</CardBody>
