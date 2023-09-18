import { useReducer } from "react"

export const CountButton = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)

  return (
    <button
      onClick={() => increase()}
      type="button"
      className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-px-4 plasmo-py-2 plasmo-text-sm plasmo-rounded-lg plasmo-transition-all plasmo-border-none
      plasmo-shadow-lg hover:plasmo-shadow-md
      active:plasmo-scale-105 plasmo-bg-slate-50 hover:plasmo-bg-slate-100 plasmo-text-slate-800 hover:plasmo-text-slate-900">
      Count:
      <span className="plasmo-inline-flex plasmo-items-center plasmo-justify-center plasmo-w-8 plasmo-h-4 plasmo-ml-2 plasmo-text-xs plasmo-font-semibold plasmo-rounded-full">
        {count}
      </span>
    </button>
  )
}

interface ButtonDetails {
  submit?: boolean
  text: string
  url: string
}

// Opens new tab with link on click
export const LinkButton = (props: ButtonDetails) => {
  return (
    <button
      className="plasmo-px-4 plasmo-py-2 plasmo-rounded-lg plasmo-transition-all plasmo-border-none
      plasmo-shadow-lg hover:plasmo-shadow-md plasmo-bg-blue-400 hover:plasmo-bg-blue-300
      plasmo-text-base plasmo-font-semibold plasmo-text-neutral-200 hover:plasmo-text-neutral-100
      active:plasmo-scale-105"
      onClick={() => window.open(props.url, "_blank")}
      type={props.submit ? "submit" : "button"}>
      {props.text}
    </button>
  )
}
