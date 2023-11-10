<script lang="ts">
  import CardBody from "~lib/chat_components/cardBody.svelte";

  export let notes = [""];
  let userNote = "";

  function addNote() {
    if (userNote.trim()) {
      notes = [...notes, userNote];
      userNote = "".trim();
    }
  }

  function removeItem(i: number): void {
    notes = notes.filter((_, index) => index !== i);
  }
</script>

<CardBody class="jn-h-full">
  <h2 class="jn-card-title">Keep for draft</h2>
  <div
    class="jn-flex jn-flex-col jn-justify-between jn-grow jn-overflow-y-auto"
  >
    <ul class="jn-list-decimal pl-5 mt-3 jn-flex-grow">
      {#each notes as note, i}
        <li class="jn-mb-4 jn-min-h-16">
          <div class="jn-flex jn-flex-row jn-justify-between">
            <p class="jn-text-ellipsis">{note}</p>
            <button
              class="jn-btn jn-btn-circle jn-btn-outline jn-min-h-0 jn-h-6 jn-w-6 jn-mt-2"
              on:click={() => removeItem(i)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="jn-h-4 jn-w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#000000"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                /></svg
              >
            </button>
          </div>
        </li>
      {/each}
    </ul>
  </div>
  <div class="jn-join">
    <textarea
      name="user-note"
      bind:value={userNote}
      class="jn-textarea jn-textarea-sm jn-textarea-secondary jn-grow
    jn-max-h-32 jn-min-h-12 jn-join-item"
      placeholder="Add notes for your draft here... Press enter to add.."
      on:keydown={(e) => {
        if (e.ctrlKey || e.altKey || e.shiftKey) return;
        if (e.key === "Enter") {
          addNote();
        }
      }}
    />
    <button
      on:click|preventDefault={addNote}
      disabled={!userNote}
      class="btn jn-join-item jn-rounded-r-full jn-btn-primary jn-w-24"
      type="submit"
    >
      Add
    </button>
  </div>
</CardBody>
