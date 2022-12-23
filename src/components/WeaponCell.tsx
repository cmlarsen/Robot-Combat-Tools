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
import SummaryBox from './SummaryBox';
import { ConfigBox } from './ConfigBox';

interface Props {
  botId: BotId;
}

export default function WeaponCell({ botId }: Props): ReactElement {
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
  const updateWatts = () => {
    const bot = getBotStore().getComputedBot(botId);
    const watts = bot.weaponMotorAmps * bot.$aBatteryVolts;
    console.log('watts', watts);
    updateBot({ weaponMotorWatts: watts });
  };

  const updateAmps = () => {
    const bot = getBotStore().getComputedBot(botId);
    const amps = bot.weaponMotorWatts / bot.$aBatteryVolts;
    console.log('amps', amps);
    updateBot({ weaponMotorAmps: amps });
  };

  return (
    <div>
      <ConfigBox title="Weapon">
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
          }}
        >
          <SummaryBox
            title={'Energy'}
            value={$weaponEnergy * weaponFullSendThrottle}
            roundPlaces={0}
            units="J"
          />
          <SummaryBox
            title={'Tip Speed'}
            value={$weaponTipSpeed * weaponFullSendThrottle}
            roundPlaces={0}
            units="m/s"
          />
          <SummaryBox title={'RPM'} value={$weaponRpm} roundPlaces={0} />
          <SummaryBox
            title={'Current draw'}
            value={$weaponFullSendAmpHours * 1000}
            roundPlaces={0}
            units="mAh"
          />
        </div>

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
            <ConfigBox title="Weapon" small>
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
            </ConfigBox>
          </div>
          <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
            <ConfigBox title="Motor" small>
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
                onBlur={updateWatts}
                units={'amps'}
              />
              <LabeledNumberInput
                title={'Motor Watts'}
                value={weaponMotorWatts}
                valueKey="weaponMotorWatts"
                roundPlaces={0}
                onBlur={updateAmps}
                units={'watts'}
              />
            </ConfigBox>
          </div>
          <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
            <ConfigBox title="Gearing" small>
              <LabeledNumberInput
                title={'Driver Gear'}
                value={weaponGearDriver}
                valueKey="weaponGearDriver"
                units="teeth"
                roundPlaces={0}
              />
              <LabeledNumberInput
                title={'Driven Gear'}
                value={weaponGearDriven}
                valueKey="weaponGearDriven"
                units="teeth"
                roundPlaces={0}
              />
              <LabeledReadOnlyInput
                title={'Gear Ratio'}
                value={$weaponGearRatio}
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
                  title={'Energy'}
                  value={$weaponEnergy * weaponFullSendThrottle}
                  roundPlaces={0}
                  units="J"
                  compact
                />
                <SummaryBox
                  title={'Tip Speed'}
                  value={$weaponTipSpeed * weaponFullSendThrottle}
                  roundPlaces={0}
                  units="m/s"
                  compact
                />
                <SummaryBox
                  title={'Current'}
                  value={$weaponFullSendAmpHours * 1000}
                  roundPlaces={0}
                  units="mAh"
                  compact
                />
              </div>
              <div>
                <LabeledRangeInput
                  title={`Throttle (${round(weaponFullSendThrottle * 100)}%)`}
                  min={0}
                  max={1}
                  step={0.05}
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
            </ConfigBox>
          </div>
          <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
            <ConfigBox title="Normal Throttle" small>
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <SummaryBox
                  title={'Energy'}
                  value={$weaponEnergy * weaponTypicalThrottle}
                  roundPlaces={0}
                  units="J"
                  compact
                />
                <SummaryBox
                  title={'Tip Speed'}
                  value={$weaponTipSpeed * weaponTypicalThrottle}
                  roundPlaces={0}
                  units="m/s"
                  compact
                />
                <SummaryBox
                  title={'Current draw'}
                  value={$weaponTypicalAmpHours * 1000}
                  roundPlaces={0}
                  units="mAh"
                  compact
                />
              </div>
              <div>
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
            </ConfigBox>
          </div>
        </div>
      </ConfigBox>
    </div>
  );
}
