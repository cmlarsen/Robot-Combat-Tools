
// import {convert} from '../convert'
import { round } from 'lodash';
import React from 'react';
import { BotId } from '../store';
import { useComputedBot } from './Bot';
import { ConfigBox } from './ConfigBox';
import SummaryBox from './SummaryBox';

export const Summary: React.FC<{ botId: BotId }> = ({ botId }) => {
  const bot = useComputedBot(botId);


//   const convertedTipSpeed2 = convert(bot.$weaponTipSpeed).possibilities()
// console.log(convertedTipSpeed2)
  return (
    <ConfigBox title="Summary">
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <SummaryBox
          title="Weapon Energy"
          value={round(bot.$weaponEnergy)}
          units={'J'}
        />

        <SummaryBox
          title={'Spin Up'}
          value={bot.$weaponSpinUpTime}
          roundPlaces={2}
          units="sec"
        />
        <SummaryBox
          title="Tip Speed"
          value={round(bot.$weaponTipSpeed)}
          units={'m/s'}
        />
        {/* <SummaryBox
          title="Tip Speed"
          value={convertedTipSpeed2}
          units={'mph'}
        /> */}
        <SummaryBox
          title="Drive Top Speed"
          value={round(bot.$driveTopSpeed, 1)}
          units={'m/s'}
        />
        <SummaryBox
          title="Est. Current Draw"
          value={round(bot.$aBatteryEstimatedAmpHours * 1000)}
          units={'mAh'}
        />
      </div>
    </ConfigBox>
  );
};
