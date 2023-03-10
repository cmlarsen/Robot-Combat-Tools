import React, { ReactElement } from 'react';
import { BotId } from '../store';
import { useComputedBot } from './Bot';
import { ConfigBox } from './ConfigBox';
import { LabeledNumberInput, LabeledReadOnlyInput } from './Inputs';

interface Props {
  botId: BotId;
}

export default function BatteryCell({ botId }: Props): ReactElement {
  const bot = useComputedBot(botId);
  return (
    <ConfigBox title="Battery" small>
      <div>
        <LabeledNumberInput
          title="Cells"
          value={bot.aBatteryCells}
          valueKey={'aBatteryCells'}
          units="cells"
        />
        <LabeledReadOnlyInput
          title="Volts"
          value={bot.$aBatteryVolts}
          roundPlaces={2}
          units="volts"
        />
        <LabeledReadOnlyInput
          title="Est. Capacity"
          value={bot.$aBatteryEstimatedAmpHours * 1000}
          roundPlaces={0}
          units="mAh"
        />
      </div>
    </ConfigBox>
  );
}
