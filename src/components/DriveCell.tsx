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
  const  bot = useComputedBot(botId);

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
              value={bot.driveMotorCount}
              valueKey="driveMotorCount"
            />
            <LabeledNumberInput
              title={'Motor Kv'}
              value={bot.driveMotorKv}
              valueKey="driveMotorKv"
              units={'Kv'}
            />
            <LabeledNumberInput
              title={'Motor Amps'}
              value={bot.driveMotorAmps}
              valueKey="driveMotorAmps"
              roundPlaces={1}
              onBlur={updateWatts}
              units={'amps'}
            />
            <LabeledNumberInput
              title={'Motor Watts'}
              value={bot.driveMotorWatts}
              valueKey="driveMotorWatts"
              roundPlaces={1}
              onBlur={updateAmps}
              units={'watts'}
            />
              <LabeledNumberInput
                title={'Motor Ri'}
                value={bot.driveMotorRiMilliOhm}
                valueKey="driveMotorRiMilliOhm"
                units={'mΩ'}
                tooltip="Internal resistance of the motor in milliohms. You can find this on most manufacturers websites."
            />
              <LabeledReadOnlyInput
                title={"Stall Torque"}
                value={bot.$driveMotorStallTorque}
                roundPlaces={2}
                units={"N•m"}
                tooltip="An approximation of stall torque based on Kv and Ri."
              />
          </ConfigBox>
        </div>
        <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
          <ConfigBox title="Gearing" small>
            <LabeledNumberInput
              title={'Wheel OD'}
              value={bot.driveWheelOD}
              valueKey="driveWheelOD"
              units={'mm'}
            />
            <LabeledNumberInput
              title={'Gearbox Reduction'}
              value={bot.driveGearboxReduction}
              valueKey="driveGearboxReduction"
            />
            <LabeledNumberInput
              title={'Secondary Reduction'}
              value={bot.driveSecondaryReduction}
              valueKey="driveSecondaryReduction"
            />
            <LabeledReadOnlyInput
              title="Total Reduction"
              value={bot.driveGearboxReduction * bot.driveSecondaryReduction}
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
                value={bot.$driveTopSpeed * bot.driveFullSendThrottle}
                roundPlaces={2}
                units={'m/s'}
                compact
              />

              <SummaryBox
                title={'Current draw'}
                value={bot.$driveFullSendAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
                compact
              />
            </div>
            <div>
              <LabeledRangeInput
                title={`Throttle (${round(bot.driveFullSendThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.05}
                value={bot.driveFullSendThrottle}
                valueKey={'driveFullSendThrottle'}
              />
              <LabeledRangeInput
                title={` Duration (${round(bot.driveFullSendDuration)} sec)`}
                min={0}
                max={180}
                step={5}
                value={bot.driveFullSendDuration}
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
                value={bot.$driveTopSpeed * bot.driveTypicalThrottle}
                roundPlaces={2}
                units={'m/s'}
                compact
              />

              <SummaryBox
                title={'Current draw'}
                value={bot.$driveTypicalAmpHours * 1000}
                roundPlaces={0}
                units="mAh"
                compact
              />
            </div>
            <div>
              <LabeledRangeInput
                title={`Throttle (${round(bot.driveTypicalThrottle * 100)}%)`}
                min={0}
                max={1}
                step={0.05}
                value={bot.driveTypicalThrottle}
                valueKey={'driveTypicalThrottle'}
              />
              <LabeledRangeInput
                title={`Duration (${round(bot.driveTypicalDuration)} sec)`}
                min={0}
                max={180}
                step={5}
                value={bot.driveTypicalDuration}
                valueKey={'driveTypicalDuration'}
              />
            </div>
          </ConfigBox>
        </div>
      </div>
    </ConfigBox>
  );
}
