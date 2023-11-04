<script context="module" lang="ts">
  import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo";
  import styleText from "data-text:./style.css";

  export const config: PlasmoCSConfig = {
    matches: ["https://job.jobnet.dk/CV/FindWork/Details/*"],
  };

  export const getStyle: PlasmoGetStyle = () => {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { applyToJobPosting, extractID } from "~services/jobNet";
  import { processErrorCode } from "~utils/buttonErrorHandling";
  import { Storage } from "@plasmohq/storage";
  import { ButtonState, type JobApplicationDetails } from "~types";

  const postingID = extractID(window.location.toString());
  const localStorageService = new Storage({ area: "local" });

  let buttonState: ButtonState;
  let buttonStyleClasses: string;
  let buttonText = "";
  let shouldHideButton = false;
  let currentButtonClickAction: (() => Promise<ButtonState>) | undefined;
  let currentError: undefined | string = undefined;

  const processButtonClick = async () => {
    if (!currentButtonClickAction) return;
    currentError = undefined;
    await updateButtonState(await currentButtonClickAction());
  };

  async function updateButtonState(newState: ButtonState) {
    if (newState === buttonState) return;
    if (newState === ButtonState.READY) {
      const storageData: Record<string, JobApplicationDetails> =
        (await localStorageService.get("jobApplicationRecords")) || {};

      buttonState =
        storageData && storageData[postingID]
          ? ButtonState.ALREADY_OPEN
          : ButtonState.READY;
    } else buttonState = newState;

    switch (buttonState) {
      case ButtonState.READY:
        buttonText = "Lav en personlig ansøgning med JobNemt!";
        currentButtonClickAction = initiateJobApplicationProcess;
        break;

      case ButtonState.PROCESSING:
        //Not used yet...
        buttonText = "Arbejder...";
        currentButtonClickAction = undefined;
        //TODO: Add loading animation
        //TODO: Add timeout error
        break;

      case ButtonState.ALREADY_OPEN:
        buttonText = "Gå til JobNemt chat";
        currentButtonClickAction = initiateJobApplicationProcess;
        break;

      case ButtonState.ERROR:
        buttonText = "Ukendt fejl...";
        if (!currentError) break;
        let { message, action } = processErrorCode(currentError);
        buttonText = message;
        currentButtonClickAction = action;
        break;
    }
  }

  async function initiateJobApplicationProcess(): Promise<ButtonState> {
    let response = await applyToJobPosting(postingID);
    if (!response.errorCode) {
      return ButtonState.ALREADY_OPEN;
    } else {
      currentError = response.errorCode;
      return ButtonState.ERROR;
    }
  }

  function toggleButtonVisibility(e: MouseEvent) {
    shouldHideButton =
      e.clientY > window.innerHeight * 0.3 &&
      (buttonState === ButtonState.READY ||
        buttonState === ButtonState.ALREADY_OPEN);
  }

  onMount(() => {
    (async () => await updateButtonState(ButtonState.READY))();
    const timer = setTimeout(() => {
      window.addEventListener("mousemove", toggleButtonVisibility);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", toggleButtonVisibility);
    };
  });

  $: {
    switch (buttonState) {
      case ButtonState.READY:
      case ButtonState.ALREADY_OPEN:
        buttonStyleClasses =
          " jn-bg-jobnet-green hover:jn-bg-jobnet-light-green";
        break;
      case ButtonState.PROCESSING:
        buttonStyleClasses = " jn-cursor-wait jn-bg-jobnet-green jn-opacity-50";
        break;
      case ButtonState.ERROR:
        buttonStyleClasses = " jn-bg-red-500 jn-text-white";
        break;
    }
  }
</script>

<button
  class:-jn-translate-y-full={shouldHideButton}
  class="apply-btn jn-transition-all jn-duration-400 jn-ease-in-out {buttonStyleClasses}"
  on:click={async () => await processButtonClick()}
>
  {buttonText}
</button>

<style>
</style>
