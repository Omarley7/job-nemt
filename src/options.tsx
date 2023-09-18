import { useStorage } from "@plasmohq/storage/hook"

function OptionsIndex() {
  const [APIKey, setAPIKey] = useStorage("APIKey", "")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
      <h1>Paste in your openAI API key to use this extention</h1>
      <input
        type="password"
        value={APIKey}
        onChange={(e) => setAPIKey(e.target.value)}
      />
    </div>
  )
}

export default OptionsIndex
