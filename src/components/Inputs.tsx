import { round } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Bot, updateBot } from '../botStore';

export const ControlledNumberInput: React.FC<{
  onBlur: (v: number) => void;
  initialValue: number;
}> = ({ onBlur, initialValue }) => {
  const [value, setValue] = useState<any>(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => onBlur(e.target.valueAsNumber)}
    />
  );
};

export const LabeledNumberInput: React.FC<{
  title: string;
  value: number;
  valueKey: keyof Bot;
  units?: string;
  roundPlaces?: number;
  tooltip?: string;
  onBlur?: (v: number) => void;
}> = ({ title, value, valueKey, units, roundPlaces, onBlur,tooltip }) => {
  const handleNumberChange = (v: number, key: keyof Bot) => {
    updateBot({ [key]: v });
  };
  return (
    <div className="inputCell" title={tooltip}>
      <span className="label">{title}{tooltip && `(?)`}</span>
      <div>
      <ControlledNumberInput
        initialValue={round(value, roundPlaces ?? Infinity)}
        onBlur={(v) => {
          handleNumberChange(v, valueKey);
          onBlur?.(v);
        }}
      />
      {units && <span className="inputUnits">{units}</span>}</div>
    </div>
  );
};
export const LabeledReadOnlyInput: React.FC<{
  title: string;
  value: number;
  roundPlaces?: number;
  units?: string;tooltip?: string;
}> = ({ title, value, units, roundPlaces, tooltip }) => {
  return (
    <div className="inputCell readOnly" title={tooltip}>

      <span className="label">{title}{tooltip && `(?)`}</span>
      <div>
      <input
        type="text"
        value={round(value, roundPlaces ?? Infinity)}
        readOnly
      />
      {units && <span className="inputUnits">{units}</span>}</div>
    </div>
  );
};
export const LabeledRangeInput: React.FC<{
  title: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueKey: keyof Bot;
}> = ({ title, min, max, step, value, valueKey }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof Bot
  ) => {
    updateBot({ [key]: parseFloat(e.target.value) });
  };
  return (
    <div className="inputCell">

      <span className="label">{title}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(e, valueKey)}
      />
    </div>
  );
};
