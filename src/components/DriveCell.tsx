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
export default function DriveCell({botId}:Props): ReactElement {
  const {

    driveMotorCount,
    driveMotorKv,
    driveMotorAmps,
    driveMotorWatts,
    driveWheelOD,
    driveGearboxReduction,
    driveSecondaryReduction,
    $driveTopSpeed,
    driveFullSendDuration,
    driveFullSendThrottle,
    driveTypicalDuration,
    driveTypicalThrottle,
    $driveFullSendAmpHours,
    $driveTypicalAmpHours,
  } = useComputedBot(botId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof Bot
  ) => {
    updateBot({ [key]: e.target.valueAsNumber });
  };

  const updateWatts = (value: number) => {
    const bot = getBotStore().getComputedBot(botId);
    const watts = bot.driveMotorAmps * bot.$aBatteryVolts;
    updateBot({ driveMotorWatts: watts });
  };

  const updateAmps = (value: number) => {
    const bot = getBotStore().getComputedBot(botId);
    const amps = bot.driveMotorWatts / bot.$aBatteryVolts;
    updateBot({ driveMotorAmps: amps });
  };

  return (
    <div>
      <h3>Drive</h3>
      <section>
        <div style={{ flex: 1 }}>
          <h4>Configuration</h4>
          <h6>Motor</h6>
          <LabeledNumberInput
            title={'Motor Count'}
            value={driveMotorCount}
            valueKey="driveMotorCount"
          />
          <LabeledNumberInput
            title={'Motor Kv'}
            value={driveMotorKv}
            valueKey="driveMotorKv"
            units={'Kv'}
          />
          <LabeledNumberInput
            title={'Motor Amps'}
            value={driveMotorAmps}
            valueKey="driveMotorAmps"
            roundPlaces={1}
            onBlur={updateWatts}
            units={'amps'}
          />
          <LabeledNumberInput
            title={'Motor Watts'}
            value={driveMotorWatts}
            valueKey="driveMotorWatts"
            roundPlaces={1}
            onBlur={updateAmps}
            units={'watts'}
          />
          <h6>Gearing</h6>
          <LabeledNumberInput
            title={'Wheel OD'}
            value={driveWheelOD}
            valueKey="driveWheelOD"
            units={'mm'}
          />
          <LabeledNumberInput
            title={'Gearbox Reduction'}
            value={driveGearboxReduction}
            valueKey="driveGearboxReduction"
          />
          <LabeledNumberInput
            title={'Secondary Reduction'}
            value={driveSecondaryReduction}
            valueKey="driveSecondaryReduction"
          />
          <LabeledReadOnlyInput
            title="Total Reduction"
            value={driveGearboxReduction * driveSecondaryReduction}
            roundPlaces={2}
          />
        </div>

        <div style={{ flex: 1.5 }}>
          <h4>Output</h4>
          <LabeledReadOnlyInput
            title="Top Speed"
            value={$driveTopSpeed}
            roundPlaces={2}
            units={'m/s'}
          />
          <h5>Throttle States</h5>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 0.5 }}>
              <strong>Full Send</strong>
              <LabeledRangeInput
                title={`Throttle (${round(driveFullSendThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.5}
                value={driveFullSendThrottle}
                valueKey={'driveFullSendThrottle'}
              />
              <LabeledRangeInput
                title={` Duration (${round(driveFullSendDuration)} sec)`}
                min={0}
                max={180}
                step={5}
                value={driveFullSendDuration}
                valueKey={'driveFullSendDuration'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <strong>Output</strong>
              <LabeledReadOnlyInput
                title="Top Speed"
                value={$driveTopSpeed * driveFullSendThrottle}
                roundPlaces={2}
                units={'m/s'}
              />

              <LabeledReadOnlyInput
                title={'Current draw'}
                value={$driveFullSendAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
              />
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ flex: 0.5 }}>
              <strong>Typical</strong>
              <LabeledRangeInput
                title={`Throttle (${round(driveTypicalThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.05}
                value={driveTypicalThrottle}
                valueKey={'driveTypicalThrottle'}
              />
              <LabeledRangeInput
                title={`Duration (${round(driveTypicalDuration)} sec)`}
                min={0}
                max={180}
                step={5}
                value={driveTypicalDuration}
                valueKey={'driveTypicalDuration'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <strong>Output</strong>

              <LabeledReadOnlyInput
                title="Top Speed"
                value={$driveTopSpeed * driveTypicalThrottle}
                roundPlaces={2}
                units={'m/s'}
              />

              <LabeledReadOnlyInput
                title={'Current draw'}
                value={$driveTypicalAmpHours * 1000}
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
