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
  import {
    Apply,
    processErrorCode,
    extractLastPart,
  } from "~services/jobDescription";

  enum ButtonState {
    READY,
    PROCESSING,
    ALREADY_OPEN,
    ERROR,
  }

  const buttonObject = (() => {
    // Private action that users will assign their actual click actions to
    let _clickAction: () => Promise<void> = async () => {};

    // Public handler that users cannot overwrite
    const handleClick = async () => {
      buttonObject.errorCode = undefined;
      buttonObject.state = ButtonState.PROCESSING;
      await _clickAction();
    };

    return {
      hide: false as boolean,
      state: ButtonState.READY as ButtonState,
      handleClick,
      set clickAction(fn: () => Promise<void>) {
        _clickAction = fn;
      },
      displayText: "" as string,
      errorCode: undefined as undefined | string,
    };
  })();

  onMount(() => {
    function handleMouseMove(e: MouseEvent) {
      buttonObject.hide =
        e.clientY > window.innerHeight * 0.3 &&
        (buttonObject.state === ButtonState.READY ||
          buttonObject.state === ButtonState.ALREADY_OPEN);
    }

    const timer = setTimeout(() => {
      window.addEventListener("mousemove", handleMouseMove);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  $: {
    if (buttonObject.errorCode) {
      buttonObject.state = ButtonState.ERROR;
    } else {
      buttonObject.state = ButtonState.READY;
      // TODO: If tab is open, set to ALREADY_OPEN
    }
  }

  $: {
    switch (buttonObject.state) {
      case ButtonState.READY:
        buttonObject.displayText = "Lav en personlig ansøgning med JobNemt!";

        buttonObject.clickAction = async () => {
          let response = await Apply(
            extractLastPart(window.location.toString())
          );
          if (response.success) {
            buttonObject.state = ButtonState.ALREADY_OPEN;
          } else {
            buttonObject.errorCode = response.data;
          }
        };
        break;

      case ButtonState.PROCESSING:
        buttonObject.displayText = "Åbner ny fane...";
        buttonObject.clickAction = async () => {};
        break;

      case ButtonState.ALREADY_OPEN:
        buttonObject.displayText = "Gå til JobNemt chat";
        buttonObject.clickAction = async () => {}; //TODO: Either reuse Apply() or make a new function
        break;

      case ButtonState.ERROR:
        buttonObject.displayText = "Ukendt fejl...";
        let { message, action } = processErrorCode(buttonObject.errorCode);
        buttonObject.displayText = message;
        buttonObject.clickAction = action;
        break;
    }
  }
</script>

<button
  class="apply-btn
    jn-transition-all jn-duration-400 jn-ease-in-out
    {buttonObject.hide ? '-jn-translate-y-full' : ''}

    {buttonObject.state === ButtonState.READY &&
    'jn-bg-jobnet-green hover:jn-bg-jobnet-light-green'}
    
    {buttonObject.state === ButtonState.PROCESSING &&
    'jn-cursor-wait jn-bg-jobnet-green jn-opacity-50'}
    
    {buttonObject.state === ButtonState.ALREADY_OPEN &&
    'jn-bg-jobnet-green hover:jn-bg-jobnet-light-green'}

    {buttonObject.state === ButtonState.ERROR && 'jn-bg-red-500 jn-text-white'}
"
  on:click={() => buttonObject.handleClick()}
>
  {buttonObject.displayText}
</button>

<style>
</style>
