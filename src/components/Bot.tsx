import React, { ReactElement } from 'react';
import {
  AppSettings,
  BotId,
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

interface Props {
  botId:BotId
}
export type BatteryId = 'a' | 'b';
export const useComputedBot = (botId: BotId) =>
  useBotStore((store) => store.getComputedBot(botId));

export default function Bot({botId}: Props): ReactElement {
  const bot = useComputedBot(botId);

  return (
    <div>

      {bot && (
        <div>
          <div id="summarySection" className="anchor" />
          <Summary botId={botId} />

          <div id="batterySection" className="anchor" />
          <BatteryCell botId={botId} />

          <div id="weaponSection" className="anchor" />
          <WeaponCell  botId={botId}/>

          <div id="driveSection" className="anchor" />
          <DriveCell botId={botId}/>
        </div>
      )}
    </div>
  );
}
