<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";
  import { onMount } from "svelte";

  export let title = "";
  export let draft = "";
  export let selected = false;

  let contentElement: HTMLElement;
  let lineCount: number;

  onMount(() => {
    calculateLineCount();
    window.addEventListener("resize", calculateLineCount);

    return () => {
      window.removeEventListener("resize", calculateLineCount);
    };
  });

  function calculateLineCount() {
    const lineHeight = parseFloat(getComputedStyle(contentElement).lineHeight);
    lineCount = Math.floor((contentElement.clientHeight + 5) / lineHeight);
    contentElement.style.webkitLineClamp = `${lineCount}`;
  }
</script>

<CardBody class="jn-h-full">
  <div class="jn-flex jn-flex-row jn-justify-between">
    <h2 class="jn-card-title">{title}</h2>
    <input
      type="radio"
      name="draft"
      class="jn-radio jn-radio-accent"
      checked={selected}
    />
  </div>
  <p bind:this={contentElement} class="p-overflow-ellipsis jn-text-sm">
    {draft}
  </p>
</CardBody>

<style lang="scss">
  .p-overflow-ellipsis {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
