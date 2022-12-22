import { getBotStore, setBotStore, useBotStore } from '../botStore';

export const BotList = () => {
  const botList = useBotStore((store) => store.bots);
  const selectedBotId = useBotStore((store) => store.selectedBotId);
  return (
    <div style={{display:'inline-block'}}>
      Select Bot:
      <select
        value={selectedBotId}
        onChange={(e) => getBotStore().selectBot(e.target.value)}
      >
        {Object.keys(botList).map((id) => {
          const bot = botList[id];
          return (
            <option key={bot.id} value={bot.id}>
              {bot.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};
