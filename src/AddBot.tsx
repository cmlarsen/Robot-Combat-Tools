import { useState } from "react"
import { getStore, setStore, } from "./store"

export const AddBot = () => {
  const [newBotName, setNewBotName] = useState('')
  return <form onSubmit={(event) => {
    if (newBotName.trim().length > 0) {
      const id = getStore().createBot(newBotName.trim())
      setNewBotName('')
      setStore({ activeBotId: id })
    }
    event.preventDefault();
  }}>
    <input type="text" value={newBotName} onChange={e => setNewBotName(e.target.value)} />
    <input type="submit" value="Add Bot" />
  </form>
}