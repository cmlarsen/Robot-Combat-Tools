import React, { ReactElement } from 'react';
import { BotId } from '../store';
import {  useBotStore } from '../store/botStore';
import { getWeaponAtThrottle2 } from '../store/utils';
import BatteryCell from './BatteryCell';
import BotGeneral from './BotGeneral';
import DriveCell from './DriveCell';
import { Summary } from './Summary';
import WeaponCell from './WeaponCell';
// import {Chartlet, LineChart} from '@stevent-team/react-chartlet'

interface Props {
  botId: BotId;
}
export type BatteryId = 'a' | 'b';
export const useComputedBot = (botId: BotId) =>
  useBotStore((store) => store.getComputedBot(botId));

export default function Bot({ botId }: Props): ReactElement {

  const bot = useComputedBot(botId);

  // const series = Array.from({ length: 21 }).map((_, i) => {
  //   const throttle = i * 0.05
  //   const a = getWeaponAtThrottle({
  //     gearRatio: bot.$weaponGearRatio,
  //     kv: bot.weaponMotorKv,
  //     magnetPoles: bot.weaponMotorPoles,
  //     maxRPM: bot.$weaponRpm,
  //     moi: bot.weaponMoi,
  //     ri: bot.weaponMotorRiMilliOhm,
  //     throttle: throttle,
  //     torque: bot.$weaponMotorStallTorque,
  //     volts: bot.$aBatteryVolts,
  //   });
  //   return [throttle, a.seconds]
  // })

  return (
    <div>
      {/* <div style={{width:100, height:100}}>
      <Chartlet series={[series]} height={100}>
        <LineChart />
      </Chartlet>
      </div> */}
      {bot && (
        <div>
          <div id="summarySection" className="anchor" />
          <Summary botId={botId} />

          <div id="batterySection" className="anchor" />
          <BotGeneral botId={botId} />

          <div id="weaponSection" className="anchor" />
          <WeaponCell botId={botId} />

          <div id="driveSection" className="anchor" />
          <DriveCell botId={botId} />
        </div>
      )}
    </div>
  );
}
