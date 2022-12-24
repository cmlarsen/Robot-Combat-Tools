import React, { ReactElement } from 'react';
import {
  BotId,
  calculateSpinupTime, getWeaponAtThrottle, useBotStore
} from '../botStore';
import BatteryCell from './BatteryCell';
import DriveCell from './DriveCell';
import { Summary } from './Summary';
import WeaponCell from './WeaponCell';

interface Props {
  botId: BotId;
}
export type BatteryId = 'a' | 'b';
export const useComputedBot = (botId: BotId) =>
  useBotStore((store) => store.getComputedBot(botId));

export default function Bot({ botId }: Props): ReactElement {
  const bot = useComputedBot(botId);
  const r = calculateSpinupTime({
    diameter: bot.weaponOd,
    momentOfInertia: bot.weaponMoi,
    motorTorque: bot.$weaponMotorStallTorque,
    rpm: bot.$weaponRpm,
  });
  // const r2 = getWeaponAtThrottle(
  //   0.05,
  //   bot.weaponMotorKv,
  //   bot.$weaponGearRatio,
  //   bot.weaponMoi,
  //   bot.$weaponMotorStallTorque,
  //   bot.$aBatteryVolts,
  //   14,
  //   bot.$weaponRpm,
  //   bot.weaponMotorRiMilliOhm
  // );
  const r2 = getWeaponAtThrottle(
    0.05,
    600,
    1,
    0.005211,
    17.66,
    22.2,
    14,
    13320,
    20
  );

  const r3 = getWeaponAtThrottle(
    0.90,
    600,
    1,
    0.005211,
    17.66,
    22.2,
    14,
    13320,
    20
  );
  // const r3 = getWeaponAtThrottle(
  //   0.90,
  //   600,
  //   1,
  //   5210655,
  //   17.66,
  //   22.2,
  //   14,
  //   13320,
  //   20
  // );
  console.log("5%", r2);
  console.log("90%", r3);



  return (
    <div>
      {bot && (
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
