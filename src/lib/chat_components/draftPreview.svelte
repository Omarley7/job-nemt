<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";

  export let title = "";
  export let draft = "";
</script>

<CardBody>
  <h2 class="jn-card-title">{title}</h2>
  <p>{draft}...</p>
</CardBody>
