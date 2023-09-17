import { type ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { LinkButton } from "~features/button"

import "~style.css"

import { URLSearchParams } from "url"

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
        type="text"
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

  const url = new URL("https://job.jobnet.dk/CV/FindWork")
  url.searchParams.append("SearchString", title)

  // "chrome-extension://" + chrome.runtime.id + "/tabs/uploadCV.html"
  return (
    <form>
      <Layout>
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
      </Layout>
    </form>
  )
}

export default IndexPopup
