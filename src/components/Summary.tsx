import React from 'react';
import { useComputedBot } from './Bot';
import { LabeledReadOnlyInput } from './Inputs';

export const Summary: React.FC = () => {
  const bot = useComputedBot();
  return (
    <div>
      <h3>Summary</h3>
      <section>
        <LabeledReadOnlyInput title="Weapon Energy" value={bot.$weaponEnergy} roundPlaces={0} units="Joules" />
        <LabeledReadOnlyInput title="Tip Speed" value={bot.$weaponTipSpeed} roundPlaces={0} units="m/s" />
        <LabeledReadOnlyInput title="Drive Speed" value={bot.$driveTopSpeed} roundPlaces={2} units="m/s" />
        <LabeledReadOnlyInput title="Current Draw" value={bot.$aBatteryEstimatedAmpHours} roundPlaces={0} units="mAh" />
      </section>
    </div>
  );
};
