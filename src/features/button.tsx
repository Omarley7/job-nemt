import { useReducer } from "react"

export const CountButton = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)

  return (
    <button
      onClick={() => increase()}
      type="button"
      className="jn-flex jn-flex-row jn-items-center jn-px-4 jn-py-2 jn-text-sm jn-rounded-lg jn-transition-all jn-border-none
      jn-shadow-lg hover:jn-shadow-md
      active:jn-scale-105 jn-bg-slate-50 hover:jn-bg-slate-100 jn-text-slate-800 hover:jn-text-slate-900">
      Count:
      <span className="jn-inline-flex jn-items-center jn-justify-center jn-w-8 jn-h-4 jn-ml-2 jn-text-xs jn-font-semibold jn-rounded-full">
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
      className="jn-px-4 jn-py-2 jn-rounded-lg jn-transition-all jn-border-none
      jn-shadow-lg hover:jn-shadow-md jn-bg-blue-400 hover:jn-bg-blue-300
      jn-text-base jn-font-semibold jn-text-neutral-200 hover:jn-text-neutral-100
      active:jn-scale-105"
      onClick={() => window.open(props.url, "_blank")}
      type={props.submit ? "submit" : "button"}>
      {props.text}
    </button>
  )
}
