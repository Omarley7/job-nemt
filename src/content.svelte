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
  import { sendToBackground } from "@plasmohq/messaging";

  import { extractJobDescription, extractID } from "~services/jobNet";
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
    const actionToExecute = currentButtonClickAction;
    await updateButtonState(ButtonState.PROCESSING);
    currentError = undefined;
    await updateButtonState(await actionToExecute());
  };

  async function updateButtonState(newState: ButtonState) {
    if (newState === buttonState) return;
    if (newState === ButtonState.READY) {
      const applicationDetails: JobApplicationDetails =
        (await localStorageService.get(postingID)) || {};

      buttonState = applicationDetails.activeTab
        ? ButtonState.ALREADY_OPEN
        : ButtonState.READY;
    } else buttonState = newState;
  }

  async function initiateJobApplicationProcess(): Promise<ButtonState> {
    let errorCode = await applyToJobPosting(postingID);
    if (!errorCode) {
      return ButtonState.ALREADY_OPEN;
    } else {
      currentError = errorCode;
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
        buttonText = "Lav en personlig ansøgning med JobNemt!";
        currentButtonClickAction = initiateJobApplicationProcess;
        buttonStyleClasses =
          "jn-bg-jobnet-green hover:jn-bg-jobnet-light-green";
        break;

      case ButtonState.ALREADY_OPEN:
        buttonText = "Gå til JobNemt chat";
        currentButtonClickAction = initiateJobApplicationProcess;
        buttonStyleClasses =
          "jn-bg-jobnet-green hover:jn-bg-jobnet-light-green";
        break;
      case ButtonState.PROCESSING:
        buttonText = "Arbejder...";
        currentButtonClickAction = undefined;
        //TODO: Add timeout error
        buttonStyleClasses = "jn-cursor-wait jn-bg-jobnet-green jn-opacity-50";
        break;
      case ButtonState.ERROR:
        buttonText = "Ukendt fejl...";
        if (!currentError) break;
        let { message, action } = processErrorCode(currentError);
        buttonText = message;
        currentButtonClickAction = action;
        buttonStyleClasses = "jn-bg-red-500 jn-text-white";
        break;
    }
  }

  async function applyToJobPosting(postingID: string): Promise<string | void> {
    const jobDescription = extractJobDescription();
    if (typeof jobDescription !== "string") {
      return jobDescription.message;
    }

    const res = await sendToBackground({
      name: "openChat",
      body: { postingID, jobDescription },
    });

    return res.error;
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
