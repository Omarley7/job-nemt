<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";

  export let title = "";
  export let draft = "";
  export let selected = false;
</script>

<CardBody>
  <div class="jn-flex jn-flex-row jn-justify-between">
    <h2 class="jn-card-title">{title}</h2>
    <input
      type="radio"
      name="draft"
      class="jn-radio jn-radio-accent"
      checked={selected}
    />
  </div>
  <p>{draft}...</p>
</CardBody>
