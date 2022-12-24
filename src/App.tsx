import './App.css';
import { getBotStore, useBotStore } from './store/botStore';
import Bot from './components/Bot';
import Header from './components/Header';

export default function App() {
  const botId = useBotStore((store) => store.selectedBotId);
  return (
    <main>
      <Header botId={botId} />
      {botId ? (
        <Bot botId={botId} />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
          }}
        >
          <button
            onClick={() => getBotStore().selectBot(getBotStore().createBot())}
            style={{ fontSize: '2em', borderRadius: '0.2em', padding: 12 }}
          >
            Create New Bot
          </button>
        </div>
      )}
    </main>
  );
}
