import './Cell.css';
import { round } from 'lodash';
import React, { ReactElement } from 'react';
import { Bot, BotId, getBotStore, updateBot } from '../botStore';
import { useComputedBot } from './Bot';
import {
  LabeledNumberInput,
  LabeledRangeInput,
  LabeledReadOnlyInput,
} from './Inputs';

interface Props {
  botId:BotId
}


export default function WeaponCell({botId}:Props): ReactElement {
  const {
    weaponGearDriven,
    weaponGearDriver,
    weaponOd,
    weaponMoi,
    $weaponEnergy,
    $weaponRpm,
    $weaponTipSpeed,
    weaponMotorKv,
    weaponMotorAmps,
    weaponMotorWatts,
    weaponFullSendThrottle,
    weaponFullSendDuration,
    weaponTypicalThrottle,
    weaponTypicalDuration,
    $weaponFullSendAmpHours,
    $weaponTypicalAmpHours,
    $weaponGearRatio,
  } = useComputedBot(botId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof Bot
  ) => {
    updateBot({ [key]: parseFloat(e.target.value) });
  };
  const updateAmps = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bot = getBotStore().getComputedBot(botId);
    const amps = parseInt(e.target.value);
    const watts = amps * bot.$aBatteryVolts;
    console.log({ watts, amps });
    updateBot({ weaponMotorWatts: watts, weaponMotorAmps: amps });
  };
  const updateWatts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bot = getBotStore().getComputedBot(botId);
    const watts = parseInt(e.target.value);
    const amps = watts / bot.$aBatteryVolts;
    console.log({ watts, amps });
    updateBot({ weaponMotorWatts: watts, weaponMotorAmps: amps });
  };
  return (
    <div>
      <h3>Weapon</h3>
      <section>
        <div style={{ flex: 1 }}>
          <h3>Configuration</h3>
          <h6>Weapon</h6>
          <LabeledNumberInput
            title={'MOI'}
            value={weaponMoi}
            valueKey="weaponMoi"
            units={'g•mm'}
          />
          <LabeledNumberInput
            title={'Weapon OD'}
            value={weaponOd}
            valueKey="weaponOd"
            units={'mm'}
          />
          <h6>Motor</h6>
          <LabeledNumberInput
            title={'Motor Kv'}
            value={weaponMotorKv}
            valueKey="weaponMotorKv"
            units={'Kv'}
          />
          <LabeledNumberInput
            title={'Motor Amps'}
            value={weaponMotorAmps}
            valueKey="weaponMotorAmps"
            roundPlaces={0}
            units={'amps'}
          />
          <LabeledNumberInput
            title={'Motor Watts'}
            value={weaponMotorWatts}
            valueKey="weaponMotorWatts"
            roundPlaces={0}
            units={'watts'}
          />
          <h6>Gearing</h6>
          <LabeledNumberInput
            title={'Driver Gear'}
            value={weaponGearDriver}
            valueKey="weaponGearDriver"
            roundPlaces={0}
          />
          <LabeledNumberInput
            title={'Driven Gear'}
            value={weaponGearDriven}
            valueKey="weaponGearDriven"
            roundPlaces={0}
          />
          <LabeledReadOnlyInput
            title={'Gear Ratio'}
            value={$weaponGearRatio}
            roundPlaces={2}
          />
        </div>
        <div style={{ flex: 1.5 }}>
          <h3>Output</h3>
          <LabeledReadOnlyInput
            title={'RPM'}
            value={$weaponRpm}
            roundPlaces={0}
            units="rpm"
          />
          <LabeledReadOnlyInput
            title={'Tip Speed'}
            value={$weaponTipSpeed}
            roundPlaces={0}
            units="m/s"
          />
          <LabeledReadOnlyInput
            title={'Max Energy'}
            value={$weaponEnergy}
            roundPlaces={0}
            units="Joules"
          />
          <h5>Throttle States</h5>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 0.5 }}>
              <strong>Full Send</strong>
              <LabeledRangeInput
                title={`Throttle (${round(weaponFullSendThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.5}
                value={weaponFullSendThrottle}
                valueKey={'weaponFullSendThrottle'}
              />
              <LabeledRangeInput
                title={` Duration (${round(weaponFullSendDuration)} sec)`}
                min={0}
                max={180}
                step={5}
                value={weaponFullSendDuration}
                valueKey={'weaponFullSendDuration'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <strong>Output</strong>
              <LabeledReadOnlyInput
                title={'Energy'}
                value={$weaponEnergy * weaponFullSendThrottle}
                roundPlaces={0}
                units="Joules"
              />
              <LabeledReadOnlyInput
                title={'Tip Speed'}
                value={$weaponTipSpeed * weaponFullSendThrottle}
                roundPlaces={0}
                units="m/s"
              />
              <LabeledReadOnlyInput
                title={'Current draw'}
                value={$weaponFullSendAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
              />
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ flex: 0.5 }}>
              <strong>Typical</strong>
              <LabeledRangeInput
                title={`Throttle (${round(weaponTypicalThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.05}
                value={weaponTypicalThrottle}
                valueKey={'weaponTypicalThrottle'}
              />
              <LabeledRangeInput
                title={` Duration (${round(weaponTypicalDuration)} sec)`}
                min={0}
                max={180}
                step={5}
                value={weaponTypicalDuration}
                valueKey={'weaponTypicalDuration'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <strong>Output</strong>
              <LabeledReadOnlyInput
                title={'Energy'}
                value={$weaponEnergy * weaponTypicalThrottle}
                roundPlaces={0}
                units="Joules"
              />
              <LabeledReadOnlyInput
                title={'Tip Speed'}
                value={$weaponTipSpeed * weaponTypicalThrottle}
                roundPlaces={0}
                units="m/s"
              />
              <LabeledReadOnlyInput
                title={'Current draw'}
                value={$weaponTypicalAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
