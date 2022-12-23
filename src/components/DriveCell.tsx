import { round } from 'lodash';
import React, { ReactElement } from 'react';
import { Bot, BotId, getBotStore, updateBot } from '../botStore';
import { useComputedBot } from './Bot';
import { ConfigBox } from './ConfigBox';
import {
  LabeledNumberInput,
  LabeledRangeInput,
  LabeledReadOnlyInput,
} from './Inputs';
import SummaryBox from './SummaryBox';

interface Props {
  botId: BotId;
}
export default function DriveCell({ botId }: Props): ReactElement {
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
    <ConfigBox title="Drive">
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
          <ConfigBox title="Motor" small>
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
          </ConfigBox>
        </div>
        <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
          <ConfigBox title="Gearing" small>
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
          </ConfigBox>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
          <ConfigBox title="Full Send Throttle" small>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <SummaryBox
                title="Top Speed"
                value={$driveTopSpeed * driveFullSendThrottle}
                roundPlaces={2}
                units={'m/s'}
                compact
              />

              <SummaryBox
                title={'Current draw'}
                value={$driveFullSendAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
                compact
              />
            </div>
            <div>
              <LabeledRangeInput
                title={`Throttle (${round(driveFullSendThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.05}
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
          </ConfigBox>
        </div>
        <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
          <ConfigBox title="Normal Throttle" small>
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <SummaryBox
                title="Top Speed"
                value={$driveTopSpeed * driveTypicalThrottle}
                roundPlaces={2}
                units={'m/s'}
                compact
              />

              <SummaryBox
                title={'Current draw'}
                value={$driveTypicalAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
                compact
              />
            </div>
            <div>
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
          </ConfigBox>
        </div>
      </div>
    </ConfigBox>
  );
}
