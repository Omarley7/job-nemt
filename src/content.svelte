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
    type errorResponse,
  } from "~services/jobDescription";

  let chatTabIndex: chrome.tabs.Tab; // TODO: Reference to tab is lost on refresh. Fix this.
  // Options:
  // 1. Store tabID in storage
  // 🌟2. Store tabID in service worker --> openChat should return tabID if open.
  // 3. Query tabs for tabID (this requires tab has a unique title or similar) possibly with URL ID from jobnet.
  // 3. https://stackoverflow.com/questions/13071384/chrome-extension-how-to-get-current-webpage-url-from-background-html
  // 3. Requires permission to tabs API :(

  enum ButtonState {
    READY,
    PROCESSING,
    ALREADY_OPEN,
    ERROR,
  }

  const buttonObject = {
    hide: false as boolean,
    state: ButtonState.READY as ButtonState,
    handleClick: async () => {},
    displayText: "" as string,
    errorCode: undefined as undefined | string,
  };

  function handleMouseMove(e: MouseEvent) {
    buttonObject.hide = e.clientY > window.innerHeight * 0.3;
  }

  onMount(() => {
    const timer = setTimeout(() => {
      window.addEventListener("mousemove", handleMouseMove);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  $: {
    switch (buttonObject.state) {
      case ButtonState.READY:
        buttonObject.displayText = "Lav en personlig ansøgning med JobNemt!";

        buttonObject.handleClick = async () => {
          buttonObject.state = ButtonState.PROCESSING;
          let response = await Apply();
          if (response.success) {
            //TODO: Add tabID
            buttonObject.state = ButtonState.ALREADY_OPEN;
          } else {
            buttonObject.state = ButtonState.ERROR;
            buttonObject.errorCode = response.errorCode;
            return;
          }
        };
        break;

      case ButtonState.PROCESSING:
        buttonObject.displayText = "Åbner ny fane...";
        buttonObject.handleClick = async () => {};
        break;

      case ButtonState.ALREADY_OPEN:
        buttonObject.displayText = "Gå til JobNemt chat";
        buttonObject.handleClick = async () => {
          chrome.tabs.update(chatTabIndex.id, {
            active: true,
            highlighted: true,
          });
        };
        break;

      case ButtonState.ERROR:
        buttonObject.displayText = "Ukendt fejl...";
        if (!buttonObject.errorCode) break;
        let { message, action } = processErrorCode(buttonObject.errorCode);
        buttonObject.handleClick = async () => {
          buttonObject.state = ButtonState.READY;
        };
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
  on:click={buttonObject.handleClick}
>
  {buttonObject.displayText}
</button>

<style>
</style>
