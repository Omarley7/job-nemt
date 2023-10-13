# Usage

Here's a demo of the extension in action:

https://github.com/Omarley7/job-nemt/assets/51030995/56347216-fe73-4fb9-bf1e-0200e6a9865b

## Install Alpha V. 0.1.0

1. Unzip [job-nemt-alpha01.zip](https://github.com/Omarley7/job-nemt/files/12702631/job-nemt-alpha01.zip) to a known location.
2. Open a Chrome-based browser and type in `chrome://extensions/` in address bar.
3. Activate developer mode in the top right corner
4. Press "Load unpacked" and find the folder "chrome-mv3-prod" that you unzipped from step 1.

## Usage

1. In the top right corner of Chrome, there's a puzzle piece icon where users can view all installed extensions. It's recommended to pin JobNemt using the pin button.
2. The first time you open the extension, it will ask you for an API key. Use either your own OpenAI API key or ask the developer for a test key.
3. Search for jobs easily on jobnet.dk :D

# Development

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## System Requirements:

- Node.js 16.14.x or later
- macOS, Windows or Linux
- Chrome or Edge
- Strongly reccomended to use [pnpm](https://pnpm.io/) as your package manager

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
