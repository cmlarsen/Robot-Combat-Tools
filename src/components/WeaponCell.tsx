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
  const bot = useComputedBot(botId);
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
            value={bot.$weaponEnergy}
            roundPlaces={0}
            units="J"
          />

          <SummaryBox
            title={'Spin Up'}
            value={bot.$weaponSpinUpTime}
            roundPlaces={2}
            units="sec"
          />

          <SummaryBox
            title={'Tip Speed'}
            value={bot.$weaponTipSpeed}
            roundPlaces={0}
            units="m/s"
          />
          <SummaryBox title={'RPM'} value={bot.$weaponRpm} roundPlaces={0} />
          <SummaryBox
            title={'Current draw'}
            value={bot.$weaponFullSendAmpHours * 1000}
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
                value={bot.weaponMoi}
                valueKey="weaponMoi"
                units={'g•mm'}
              />
              <LabeledNumberInput
                title={'Weapon OD'}
                value={bot.weaponOd}
                valueKey="weaponOd"
                units={'mm'}
              />
            </ConfigBox>
            <ConfigBox title="Gearing" small>
              <LabeledNumberInput
                title={'Driver Gear'}
                value={bot.weaponGearDriver}
                valueKey="weaponGearDriver"
                units="teeth"
                roundPlaces={0}
              />
              <LabeledNumberInput
                title={'Driven Gear'}
                value={bot.weaponGearDriven}
                valueKey="weaponGearDriven"
                units="teeth"
                roundPlaces={0}
              />
              <LabeledReadOnlyInput
                title={'Gear Ratio'}
                value={bot.$weaponGearRatio}
                roundPlaces={2}
              />
            </ConfigBox>
          </div>
          <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
            <ConfigBox title="Motor" small>
              <LabeledNumberInput
                title={'Motor Kv'}
                value={bot.weaponMotorKv}
                valueKey="weaponMotorKv"
                units={'Kv'}
              />
              <LabeledNumberInput
                title={'Motor Poles'}
                value={bot.weaponMotorPoles}
                valueKey="weaponMotorPoles"
                units={'poles'}
                tooltip={"This can be found on the manufaturers website. 14 is common for out runners"}
              />

              <LabeledNumberInput
                title={'Motor Amps'}
                value={bot.weaponMotorAmps}
                valueKey="weaponMotorAmps"
                roundPlaces={0}
                onBlur={updateWatts}
                units={'amps'}
              />
              <LabeledNumberInput
                title={'Motor Watts'}
                value={bot.weaponMotorWatts}
                valueKey="weaponMotorWatts"
                roundPlaces={0}
                onBlur={updateAmps}
                units={'watts'}
              />
              <LabeledNumberInput
                title={'Motor Ri'}
                value={bot.weaponMotorRiMilliOhm}
                valueKey="weaponMotorRiMilliOhm"
                units={'mΩ'}
                tooltip="Internal resistance of the motor in milliohms. You can find this on most manufacturers websites."
              />
              <LabeledReadOnlyInput
                title={"Stall Torque"}
                value={bot.$weaponMotorStallTorque}
                roundPlaces={2}
                units={"N•m"}
                tooltip="An approximation of stall torque based on Kv and Ri."
              />
            </ConfigBox>
          </div>
          {/* <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
            <ConfigBox title="Gearing" small>
              <LabeledNumberInput
                title={'Driver Gear'}
                value={bot.weaponGearDriver}
                valueKey="weaponGearDriver"
                units="teeth"
                roundPlaces={0}
              />
              <LabeledNumberInput
                title={'Driven Gear'}
                value={bot.weaponGearDriven}
                valueKey="weaponGearDriven"
                units="teeth"
                roundPlaces={0}
              />
              <LabeledReadOnlyInput
                title={'Gear Ratio'}
                value={bot.$weaponGearRatio}
                roundPlaces={2}
              />
            </ConfigBox>
          </div> */}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <div style={{ flex: 1, paddingLeft: 6, paddingRight: 6 }}>
            <ConfigBox title="Full Send Throttle" small>
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <SummaryBox
                  title={'Energy'}
                  value={bot.$weaponEnergy * bot.weaponFullSendThrottle}
                  roundPlaces={0}
                  units="J"
                  compact
                />
                <SummaryBox
                  title={'Spin  up'}
                  value={bot.$weaponFullSendSpinUpTime}
                  roundPlaces={2}
                  units="sec"
                  compact
                />
                <SummaryBox
                  title={'Tip Speed'}
                  value={bot.$weaponTipSpeed * bot.weaponFullSendThrottle}
                  roundPlaces={0}
                  units="m/s"
                  compact
                />
                <SummaryBox
                  title={'Current'}
                  value={bot.$weaponFullSendAmpHours * 1000}
                  roundPlaces={0}
                  units="mAh"
                  compact
                />
              </div>
              <div>
                <LabeledRangeInput
                  title={`Throttle (${round(bot.weaponFullSendThrottle * 100)}%)`}
                  min={0}
                  max={1}
                  step={0.05}
                  value={bot.weaponFullSendThrottle}
                  valueKey={'weaponFullSendThrottle'}
                />
                <LabeledRangeInput
                  title={` Duration (${round(bot.weaponFullSendDuration)} sec)`}
                  min={0}
                  max={180}
                  step={5}
                  value={bot.weaponFullSendDuration}
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
                  value={bot.$weaponEnergy * bot.weaponTypicalThrottle}
                  roundPlaces={0}
                  units="J"
                  compact
                />
                <SummaryBox
                  title={'Spin  up'}
                  value={bot.$weaponTypicalSpinUpTime}
                  roundPlaces={2}
                  units="sec"
                  compact
                />
                <SummaryBox
                  title={'Tip Speed'}
                  value={bot.$weaponTipSpeed * bot.weaponTypicalThrottle}
                  roundPlaces={0}
                  units="m/s"
                  compact
                />
                <SummaryBox
                  title={'Current draw'}
                  value={bot.$weaponTypicalAmpHours * 1000}
                  roundPlaces={0}
                  units="mAh"
                  compact
                />
              </div>
              <div>
                <LabeledRangeInput
                  title={`Throttle (${round(bot.weaponTypicalThrottle * 100)}%)`}
                  min={0}
                  max={1}
                  step={0.05}
                  value={bot.weaponTypicalThrottle}
                  valueKey={'weaponTypicalThrottle'}
                />
                <LabeledRangeInput
                  title={`Duration (${round(bot.weaponTypicalDuration)} sec)`}
                  min={0}
                  max={180}
                  step={5}
                  value={bot.weaponTypicalDuration}
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
