import React, { ReactElement } from 'react';
import {
  BotId,
  calculateSpinupTime, getWeaponAtThrottle, getWeaponAtThrottle2, useBotStore
} from '../botStore';
import BatteryCell from './BatteryCell';
import DriveCell from './DriveCell';
import { Summary } from './Summary';
import WeaponCell from './WeaponCell';
import { Chartlet, LineChart } from '@stevent-team/react-chartlet'

interface Props {
  botId: BotId;
}
export type BatteryId = 'a' | 'b';
export const useComputedBot = (botId: BotId) =>
  useBotStore((store) => store.getComputedBot(botId));

export default function Bot({ botId }: Props): ReactElement {
  const bot = useComputedBot(botId);

  // const data =  Array.from({ length: 101 }, (_, i) => i * .01).map(t => {
  //   const {
  //     rpm,
  //     joules,
  //     seconds
  //   } = getWeaponAtThrottle({
  //     gearRatio: bot.weaponGearDriven / bot.weaponGearDriver,
  //     kv: bot.weaponMotorKv,
  //     magnetPoles: bot.weaponMotorPoles,
  //     maxRPM: bot.$weaponRpm,
  //     moi: bot.weaponMoi,
  //     ri: bot.weaponMotorRiMilliOhm,
  //     throttle: t,
  //     torque: bot.$weaponMotorStallTorque,
  //     volts: bot.$aBatteryVolts,
  //   });
  //   return { seconds, joules, rpm }
  // })
  // const series1 = data.map(d=>[d.seconds,d.joules])
  // const series2 = data.map(d=>[d.seconds,d.rpm])




  return (
    <div>
      {/* <div style={{width:100, height:100}}>
      <Chartlet series={[series1,series2]} height={100}>
        <LineChart />
      </Chartlet>
      </div> */}
      {bot &&
         (
        <div>
          <div id="summarySection" className="anchor" />
          <Summary botId={botId} />

          <div id="batterySection" className="anchor" />
          <BatteryCell botId={botId} />

          <div id="weaponSection" className="anchor" />
          <WeaponCell botId={botId} />

          <div id="driveSection" className="anchor" />
          <DriveCell botId={botId} />
        </div>
      )}
    </div>
  );
}
