import React, { ReactElement } from 'react';
import { BotId } from '../store';
import BatteryCell from './BatteryCell';
import { useComputedBot } from './Bot';
import { ConfigBox } from './ConfigBox';
import { LabeledNumberInput, LabeledReadOnlyInput } from './Inputs';

interface Props {
  botId: BotId;
}

export default function BotGeneral({ botId }: Props): ReactElement {
  const bot = useComputedBot(botId);
  return (
    <ConfigBox title="Bot">
      <BatteryCell botId={botId} />
      <ConfigBox title="Dimensions" small>
        <LabeledNumberInput
          title="Wheelbase Width"
          value={bot.wheelBaseWidth}
          valueKey={'wheelBaseWidth'}
          units="mm"
        />
        <LabeledNumberInput
          title="Bot Weight"
          value={bot.botMass}
          valueKey={'botMass'}
          units="g"
        />
        <LabeledReadOnlyInput
          title="Max Spin Rate"
          value={bot.$maxSpinRate}
          roundPlaces={2}
          units="sec/rev"
        />
                <LabeledReadOnlyInput
          title="Max Flat Turn Rate"
          tooltip="How fast you can turn without your wheel rising up."
          value={bot.$maxFlatTurnRate}
          roundPlaces={2}
          units="sec/rev"
        />
        <LabeledReadOnlyInput
          title="Force on raising wheel"
          tooltip="How much force is on the wheel that is raising up when you turn with the weapon fully spun up. If it is negative, then wheel is in the air, positive and you've got good traction."
          value={bot.$forceOnRaisingWheel}
          roundPlaces={2}
          units="Newtons"
        />

      </ConfigBox>
    </ConfigBox>
  );
}
