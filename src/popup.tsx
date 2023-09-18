import { type ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { LinkButton } from "~features/button"

import "~style.css"

function Layout({ children }) {
  return (
    <div
      className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-p-3"
      style={{ width: "16rem" }}>
      {children}
    </div>
  )
}

interface InputProps {
  boldLabel?: boolean
  label: string
  placeholder: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  type?: string
}

function Input(props: InputProps) {
  return (
    <div className="plasmo-flex plasmo-flex-row plasmo-justify-center plasmo-p-4">
      <div style={{ marginRight: "0.2rem" }}>
        <label
          className={`${
            props.boldLabel !== undefined ? "plasmo-font-bold" : ""
          } plasmo-text-base plasmo-font-sans`}>
          {props.label}
        </label>
        <br />
      </div>
      <input
        id="name"
        type={props.type || "text"}
        style={{ width: "min-content", maxWidth: "60%" }}
        placeholder={props.placeholder}
        className={`plasmo-flex plasmo-flex-shrink plasmo-text-base plasmo-font-sans plasmo-bg-zinc-100 plasmo-rounded-lg`}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  )
}

function IndexPopup() {
  const [name, setName] = useStorage("user-name", "")
  const [title, setTitle] = useStorage("user-title", "")
  const [APIKey, setAPIKey] = useStorage("APIKey", "")

  const url = new URL("https://job.jobnet.dk/CV/FindWork")
  url.searchParams.append("SearchString", title)

  //q: What is the comment syntax in React HTML? <!-- --> doesn't work
  //a: {/* */} works

  const uploadURL =
    "chrome-extension://" + chrome.runtime.id + "/tabs/uploadCV.html"
  return (
    <>
      <form>
        <Layout>
          {/** TODO: Should only run when focus leaves input. Error handle invalid API key */}
          {APIKey === "" ? (
            <>
              <h1 className="plasmo-text-2xl plasmo-font-bold plasmo-font-sans">
                Indsæt din OpenAI API nøgle
              </h1>
              <Input
                label="API nøgle"
                type="password"
                onChange={(e) => setAPIKey(e.target.value)}
                placeholder="[indsæt API nøgle]"
                value={APIKey}
                boldLabel
              />
            </>
          ) : (
            <>
              <Input
                label="Hej"
                onChange={(e) => setName(e.target.value)}
                placeholder="[indsæt navn]"
                value={name}
                boldLabel
              />
              <Input
                label="Stilling"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="[indsæt titel]"
                value={title}
              />

              <LinkButton text={"Find job nemt"} url={url.toString()} submit />
            </>
          )}
          <LinkButton text={"Upload CV"} url={uploadURL} />
        </Layout>
      </form>
    </>
  )
}

export default IndexPopup
