import React, { ReactElement } from 'react';
import { BotId, getBotStore, updateBot, useBotStore } from '../botStore';
import { useComputedBot } from './Bot';
import { BotList } from './BotList';
import CreateBotButton from './CreateBotButton';

interface Props {
  botId: BotId;
}

export default function Header({ botId }: Props): ReactElement {
  const name = useBotStore((store) =>
    botId ? store.getComputedBot(botId).name : ''
  );
  return (
    <header>
      <div>
        <h1>
          Bot
          {botId && (
            <>
              :{' '}
              <input
                type="text"
                value={name}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1em',
                  fontWeight: 700,
                  width: 'auto',
                  textAlign: 'left',
                  borderBottom: '1px solid lightgray',
                }}
                onChange={(e) => {
                  updateBot({ name: e.target.value.trimStart() });
                }}
              />
            </>
          )}
        </h1>
        <div>
          <a href="#summarySection">Summary</a> |{' '}
          <a href="#batterySection">Battery</a> |{' '}
          <a href="#weaponSection">Weapon</a> |{' '}
          <a href="#driveSection">Drive</a>
        </div>
      </div>

      <div>
        <BotList />
        <CreateBotButton />
      </div>
    </header>
  );
}
