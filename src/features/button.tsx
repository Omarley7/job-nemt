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
