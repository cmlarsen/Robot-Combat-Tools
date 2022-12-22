import React, { ReactElement } from 'react';
import {
  AppSettings,
  getBotStore,
  setBotStore,
  updateBot,
  useBotStore,
} from '../botStore';
import BatteryCell from './BatteryCell';
import { BotList } from './BotList';
import DriveCell from './DriveCell';
import { Summary } from './Summary';
import WeaponCell from './WeaponCell';

interface Props {}
export type BatteryId = 'a' | 'b';
export const useComputedBot = () =>
  useBotStore((store) => store.getComputedBot(store.selectedBotId));

export default function Bot({}: Props): ReactElement {
  const appSettings = useBotStore((store) => store.appSettings);
  const bot = useComputedBot();

  return (
    <div>
      <header>
        <div>
          <h1>
            Bot
            {bot && (
              <>
                :{' '}
                <input
                  type="text"
                  value={bot.name}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1em',
                    fontWeight: 700,
                    textDecoration: 'underline',
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
          <button
            onClick={() => {
              const botId = getBotStore().createBot();
              getBotStore().selectBot(botId);
            }}
          >
            Create bot
          </button>
        </div>
      </header>
      {bot && (
        <div>
          <div id="summarySection" className="anchor" />
          <Summary />

          <div id="batterySection" className="anchor" />
          <BatteryCell />

          <div id="weaponSection" className="anchor" />
          <WeaponCell />

          <div id="driveSection" className="anchor" />
          <DriveCell />
        </div>
      )}
    </div>
  );
}
