<script context="module" lang="ts">
  import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo";
  import styleText from "data-text:./style.css";

  export const config: PlasmoCSConfig = {
    matches: ["https://job.jobnet.dk/CV/FindWork/Details/*"],
  };

  export const getStyle: PlasmoGetStyle = () => {
    console.log("getStyle called");
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { sendToBackground } from "@plasmohq/messaging";
  const DEFAULT_BUTTON_TEXT = "Lav en personlig ansøgning med JobNemt!";

  enum ButtonState {
    READY,
    PROCESSING,
    ALREADY_OPEN,
    ERROR,
  }

  let showButton = true;
  let currentButtonState = ButtonState.READY;
  let tabId: chrome.tabs.Tab;
  let currentButtonText = DEFAULT_BUTTON_TEXT;

  function extractJobDescription(): HTMLElement {
    return document.querySelector("section.job-description-col");
  }

  onMount(() => {
    const handleMouseMove = (e) => {
      if (e.clientY > window.innerHeight * 0.3) {
        showButton = true;
      } else {
        showButton = true;
      }
    };

    setTimeout(() => {
      window.addEventListener("mousemove", handleMouseMove);
    }, 2000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  //   $: currentButtonText = buttonInProcessingState
  //     ? `Åbner ny fane... (${remainingSeconds})`
  //     : DEFAULT_BUTTON_TEXT;

  async function handleApplyClick() {
    switch (currentButtonState) {
      case ButtonState.READY:
        currentButtonState = ButtonState.PROCESSING;
        const jobDescription = extractJobDescription();
        if (!jobDescription) {
          console.error("No job description found");
        } else {
          const res = await sendToBackground({
            name: "openChat",
            body: jobDescription.innerText,
          });
          if (res.error) {
            displayError(res.error);
            currentButtonState = ButtonState.ERROR;
            break;
          }
        }
        break;

      case ButtonState.PROCESSING:
        // Do nothing;
        break;
      case ButtonState.ALREADY_OPEN:
        //await handleAlreadyOpenState();
        break;
      case ButtonState.ERROR:
        //await handleErrorState();
        break;
    }
  }

  function displayError(error: string) {
    console.log(error);
    switch (error) {
      case "missing_cv":
        alert("Du skal uploade dit CV før du kan ansøge med JobNemt");
        sendToBackground({ name: "openCVmanager" });
        break;
      case "missing_api_key":
        alert("Du skal indtaste din API nøgle før du kan ansøge med JobNemt");
        sendToBackground({ name: "openSettings" });
        break;
      case "invalid_api_key":
        alert(
          "Der er er muligvis en fejl med din API nøgle. Prøv at indtaste den igen. Den starter med 'sk-'"
        );
        sendToBackground({ name: "openSettings" });
        break;
      default:
        console.error(error);
        alert("Der skete en ukendt fejl. Prøv igen senere");
    }
  }
</script>

{#if showButton}
  <button
    class="apply-btn jn-bg-jobnet-green
    jn-transition-all jn-duration-400 jn-ease-in-out
    {true ? 'hover:jn-bg-jobnet-light-green' : ''}
    {!true ? '-jn-translate-y-full' : ''} "
    on:click={handleApplyClick}
  >
    {currentButtonText} help please. send
  </button>
{/if}

<style>
</style>
