import { getStore, setStore, useStore } from "./store";



export const BotList = () => {
  const botList = useStore(store => store.bots)
  return <div>
    {Object.keys(botList).map(id => {
      const bot = botList[id]
      return <div key={bot.id}>
        {bot.name}
        <input type="button" value="Edit" onClick={() => {
          setStore({ activeBotId: bot.id });
        }} />
        <input type="button" value="Delete" onClick={() => getStore().deleteBot(bot.id)} />
      </div>
    })}
    {botList.length && <button onClick={() => setStore({ bots: {} })}>Delete All</button>}
  </div>
}