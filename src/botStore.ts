import create from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import {
  DebounceSettings,
  filter,
  omit,
  omitBy,
  round,
  unescape,
} from 'lodash';
import { nanoid } from 'nanoid';
import produce from 'immer';
import name from 'project-name-generator';
import convert from 'convert';
export const VOLTS_PER_CELL = 3.7;
export type BotId = string;

export type Joules = number;
interface BatterySystem {
  aBatteryCells: number;
}
interface ComputedBatterySystem {
  $aBatteryVolts: number;
  $aBatteryEstimatedAmpHours: number;
}

interface WeaponSystem {
  weaponGearDriver: number;
  weaponGearDriven: number;
  weaponOd: number;
  weaponMoi: number;
  weaponMotorKv: number;
  weaponMotorWatts: number;
  weaponMotorAmps: number;
  weaponMotorRiMilliOhm: number;
  weaponFullSendThrottle: number;
  weaponFullSendDuration: number;
  weaponTypicalThrottle: number;
  weaponTypicalDuration: number;
}

interface ComputedWeaponSystem {
  $weaponEnergy: number;
  $weaponRpm: number;
  $weaponSpinUpTime: number;
  $weaponMotorStallTorque: number;
  $weaponTipSpeed: number;
  $weaponGearRatio: number;
  $weaponFullSendAmps: number;
  $weaponFullSendWattHours: number;
  $weaponFullSendAmpHours: number;
  $weaponTypicalAmps: number;
  $weaponTypicalWattHours: number;
  $weaponTypicalAmpHours: number;
}

interface DriveSystem {
  driveMotorCount: number;
  driveMotorKv: number;
  driveMotorAmps: number;
  driveMotorWatts: number;
  driveMotorRiMilliOhm: number;
  driveGearboxReduction: number;
  driveSecondaryReduction: number;
  driveWheelOD: number;
  driveFullSendThrottle: number;
  driveFullSendDuration: number;
  driveTypicalThrottle: number;
  driveTypicalDuration: number;
}

interface ComputedDriveSystem {
  $driveTopSpeed: number;
  $driveMotorStallTorque: number;
  $driveFullSendAmps: number;
  $driveFullSendWattHours: number;
  $driveFullSendAmpHours: number;
  $driveTypicalAmps: number;
  $driveTypicalWattHours: number;
  $driveTypicalAmpHours: number;
}

export type Bot = BatterySystem &
  WeaponSystem &
  DriveSystem & {
    id: BotId;
    name: string;
  };

export type ComputedBot = Bot &
  ComputedBatterySystem &
  ComputedWeaponSystem &
  ComputedDriveSystem;

type Units = 'metric' | 'imperial';

export interface AppSettings {
  units: Units;
}

export interface BotStore {
  appSettings: AppSettings;
  bots: Record<BotId, Bot>;
  selectedBotId: BotId;
  getComputedBot: (botId: BotId) => ComputedBot;
  createBot: () => BotId;
  deleteBot: (botId: BotId) => void;
  updateBot: (update: Partial<Bot>) => void;
  selectBot: (botId: BotId) => void;
  updateSettings: (settings: AppSettings) => void;
}

const blankBot: Bot = {
  id: 'id',
  name: 'name',
  aBatteryCells: 3,
  weaponGearDriver: 1,
  weaponGearDriven: 1,
  weaponOd: 100,
  weaponMoi: 100000,
  weaponMotorKv: 2000,
  weaponMotorWatts: 1,
  weaponMotorAmps: 1,
  weaponMotorRiMilliOhm: 0,
  weaponFullSendThrottle: 1,
  weaponFullSendDuration: 20,
  weaponTypicalThrottle: 0.5,
  weaponTypicalDuration: 160,
  driveMotorCount: 2,
  driveMotorKv: 2000,
  driveMotorWatts: 1,
  driveMotorAmps: 1,
  driveMotorRiMilliOhm: 0,
  driveGearboxReduction: 1,
  driveSecondaryReduction: 1,
  driveWheelOD: 40,
  driveFullSendThrottle: 1,
  driveFullSendDuration: 20,
  driveTypicalThrottle: 0.5,
  driveTypicalDuration: 160,
};
export const useBotStore = create<BotStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => {
        return {
          appSettings: {
            units: 'metric',
          },
          selectedBotId: '',
          bots: {},
          getComputedBot: (botId) => {
            const bot = get().bots[botId];
            const $aBatteryVolts = bot.aBatteryCells * VOLTS_PER_CELL;

            const computedWeapon: ComputedWeaponSystem = {
              $weaponSpinUpTime: -1,
              ...calcComputedWeapon(bot, $aBatteryVolts),
            };

            const computedDrive: ComputedDriveSystem = {
              ...calcComputedDrive(bot, $aBatteryVolts),
            };

            const $aBatteryEstimatedAmpHours =
              computedWeapon.$weaponFullSendAmpHours +
              computedWeapon.$weaponTypicalAmpHours +
              (computedDrive.$driveFullSendAmpHours +
                computedDrive.$driveTypicalAmpHours);

            return {
              ...bot,
              $aBatteryVolts,
              $aBatteryEstimatedAmpHours,
              ...computedDrive,
              ...computedWeapon,
            };
          },
          createBot: () => {
            const id = nanoid();
            const bot = {
              ...blankBot,
              id,
              name: name().spaced,
            };
            set((store) => ({ bots: { ...store.bots, [id]: bot } }));
            return id;
          },
          deleteBot: (botId) => {
            const bots = { ...get().bots };
            delete bots[botId];
            set({ bots });
          },
          updateBot: (update) => {
            const botId = get().selectedBotId;
            if (!botId) {
              return;
            }

            const prevBot = get().getComputedBot(botId);
            set((store) => ({
              bots: {
                ...store.bots,
                [botId]: { ...store.bots[botId], ...update },
              },
            }));

            // Side effects
            let sideEffectsUpdate: Partial<Bot> = {};
            const updatedBot = get().getComputedBot(botId);
            // Recalc things based dependent aBatteryCells
            if (Object.keys(update).includes('aBatteryCells')) {
              sideEffectsUpdate.weaponMotorWatts =
                updatedBot.weaponMotorAmps * updatedBot.$aBatteryVolts;
            }

            set((store) => ({
              bots: {
                ...store.bots,
                [botId]: { ...store.bots[botId], ...sideEffectsUpdate },
              },
            }));
          },
          selectBot: (botId) => set({ selectedBotId: botId }),
          updateSettings: (settings) => {
            set((store) => ({
              appSettings: { ...store.appSettings, ...settings },
            }));
          },
        };
      }),
      {
        name: 'bot-store-storage',
      }
    )
  )
);

export const setBotStore = useBotStore.setState;
export const getBotStore = useBotStore.getState;
export const updateBot = getBotStore().updateBot;

/** Returns Torque in N•m */
export function calcBrushlessTorque(volts: number, kv: number, ri: number) {
  //  From http://runamok.tech/RunAmok/spincalc_help.html

  // brushless torque estimation volts kv ri -- revs stall
  // 'NOTE: * 1.25' is a correction factor for reduced current at low RPM from the brushless motor controller.
  // const torque = ((1352 / kv) * (volts / (ri * 0.001))) / (141.61 * 1.25);
  const torque = ((1352 / kv) * (volts / (ri * 0.001))) / 141.61;

  // The 'SimonK' ESC firmware by default start at 1/4 current up to a few hundred RPM before fully kicking in.
  return torque;
}

function calcComputedDrive(bot: Bot, $aBatteryVolts: number) {
  const $driveFullSendAmps =
    bot.driveMotorAmps * bot.driveFullSendThrottle * bot.driveMotorCount;

  const $driveFullSendWattHours =
    $driveFullSendAmps * $aBatteryVolts * (bot.driveFullSendDuration / 60 / 60);

  const $driveFullSendAmpHours = $driveFullSendWattHours / $aBatteryVolts;

  const $driveTypicalAmps =
    bot.driveMotorAmps * bot.driveTypicalThrottle * bot.driveMotorCount;

  const $driveTypicalWattHours =
    $driveTypicalAmps * $aBatteryVolts * (bot.driveTypicalDuration / 60 / 60);

  const $driveTypicalAmpHours = $driveTypicalWattHours / $aBatteryVolts;
  const $driveMotorStallTorque = calcBrushlessTorque(
    $aBatteryVolts,
    bot.driveMotorKv,
    bot.driveMotorRiMilliOhm
  );
  const $driveTopSpeed =
    (($aBatteryVolts * bot.driveMotorKv) /
      bot.driveGearboxReduction /
      bot.driveSecondaryReduction) *
    (((bot.driveWheelOD / 1000) * Math.PI) / 60);
  return {
    $driveTopSpeed,
    $driveFullSendAmps,
    $driveFullSendWattHours,
    $driveFullSendAmpHours,
    $driveTypicalAmps,
    $driveTypicalWattHours,
    $driveTypicalAmpHours,
    $driveMotorStallTorque,
  };
}

function calcComputedWeapon(bot: Bot, $aBatteryVolts: number) {
  const $weaponGearRatio = bot.weaponGearDriven / bot.weaponGearDriver;
  const $weaponRpm = (bot.weaponMotorKv * $aBatteryVolts) / $weaponGearRatio;
  const $weaponTipSpeed = (bot.weaponOd * Math.PI * ($weaponRpm / 60)) / 1000;

  const kgm = bot.weaponMoi * 0.000000001;
  const rads = rpmToRads($weaponRpm);
  const $weaponEnergy = calcKineticEnergy(kgm, rads);

  const $weaponFullSendAmps = bot.weaponMotorAmps * bot.weaponFullSendThrottle;
  const $weaponFullSendWattHours =
    $weaponFullSendAmps *
    $aBatteryVolts *
    (bot.weaponFullSendDuration / 60 / 60);
  const $weaponFullSendAmpHours = $weaponFullSendWattHours / $aBatteryVolts;

  const $weaponTypicalAmps = bot.weaponMotorAmps * bot.weaponTypicalThrottle;
  const $weaponTypicalWattHours =
    $weaponTypicalAmps * $aBatteryVolts * (bot.weaponTypicalDuration / 60 / 60);
  const $weaponTypicalAmpHours = $weaponTypicalWattHours / $aBatteryVolts;

  const $weaponMotorStallTorque = calcBrushlessTorque(
    $aBatteryVolts,
    bot.weaponMotorKv,
    bot.weaponMotorRiMilliOhm
  );

  return {
    $weaponGearRatio,
    $weaponEnergy,
    $weaponRpm,
    $weaponTipSpeed,
    $weaponFullSendAmps,
    $weaponFullSendWattHours,
    $weaponFullSendAmpHours,
    $weaponTypicalAmps,
    $weaponTypicalWattHours,
    $weaponTypicalAmpHours,
    $weaponMotorStallTorque,
  };
}

function calcKineticEnergy(kgm: number, rads: number): Joules {
  return 0.5 * kgm * Math.pow(rads, 2);
}

export function rpmToRads(rpm: number) {
  const radPerSec = (rpm * 2 * Math.PI) / 60;
  return radPerSec;
}
export function radsToRPM(radPerSec: number) {
  const rpm = (radPerSec * 60) / (2 * Math.PI);
  return rpm;
}

/** From chatGPT */
interface BrushlessMotorInputs {
  momentOfInertia: number; // g•mm
  motorTorque: number; // N•m
  rpm: number;
  diameter: number; // mm
}

interface BrushlessMotorOutputs {
  speedInRads: number; // rad/s
  kineticEnergy: Joules; // Joules
  spinUpTime: number; // seconds
}

function gmm2ToKgm2(v: number) {
  return  v / 10000000
}
function kgm2toGmm2(v: number) {
  return  v * 10000000
}

export function calculateSpinupTime(
  inputs: BrushlessMotorInputs
): BrushlessMotorOutputs {
  const { momentOfInertia, motorTorque, rpm, diameter } = inputs;

  // convert moment of inertia to kg•m^2
  const momentOfInertiaKgM2 = momentOfInertia / 10000000;

  // convert diameter to m
  const diameterM = diameter / 1000;

  // calculate tip speed in m/s
  const speedInRads = (rpm * 2 * Math.PI * diameterM) / 60;

  // calculate kinetic energy in Joules
  const kineticEnergy = 0.5 * momentOfInertiaKgM2 * Math.pow(speedInRads, 2);

  // calculate spin up time in seconds
  // var radians = (gear * speed.value * Math.PI) / 30;
  // var time = (total * radians) / torque3;

  // ke = 0.50285 * total * Math.pow(radians, 2); // 0.00285 is a correction factor for funky JavaScript math //caleb: hmmm?
  const spinUpTime = (momentOfInertiaKgM2 * (rpm / 60)) / motorTorque;
  return { speedInRads, kineticEnergy, spinUpTime };
}

/**
 * Functions transferred from the Ask Aaron spreadsheet
 */

/** Commutation time in u-sec below which 'soft start' restriction is active. Default value: 1024 */
const COMMUTATION_MAX = 1024;
/**Maximum power pulse length during 'soft start'. PWR_MAX_RPM1 Default value: 25% */
const POWER_MAX = 0.25;

const getTimeConstant = (
  kv: number,
  gearRatio: number,
  moi: number,
  torque: number,
  volts: number
) => {
  const L4 = 1;
  const L5 = 2;
  const L8 = 3;
  const F2 = 1;
  const E28 = 3;

  const r = ((((L4 * L5) / L8) * 0.105) / F2) * L8 * E28;
  const r2 = ((((volts * kv) / gearRatio) * 0.105) / torque) * gearRatio * moi;
  // return ((volts * kv) / gearRatio / 0.105 / (torque * gearRatio)) * moi;
  console.log("timeConstant", {
    kv,
    gearRatio,
    moi,
    torque,
    volts
  })
  return r2
};

/**Time constant when ESC 'soft start' is active. */
const getSoftStartTimeConstant = (timeConstant: number) => {
  // B2*(1/Calculations::Table 1::$L$11)

  return timeConstant * (1 / POWER_MAX);
};

/**Theoretical Stall Amps */
const getStallAmps = (volts: number, ri: number) => {
  // 1000*Calculations::Table 1::L4/Calculations::Table 1::L6
  return (1000 * volts) / ri;
};

/** Weapon RPM where ESC 'soft start' cuts out. */
const getCutOverRpm = (magnets: number, gearRatio: number) => {
  // IF(A2=1,0,(60/($H$2*3*(Calculations::Table 1::L10/1000000)))/$I$2)
  return 60 / (magnets * 3 * (COMMUTATION_MAX / 1000000)) / gearRatio;
};

export function getWeaponAtThrottle(
  throttle: number,
  kv: number,
  gearRatio: number,
  moi: number,
  torque: number,
  volts: number,
  /** ESC 'soft start' is based on 'commutation interval' which is based on mechanical RPM and the number of magnet poles. */
  magnetPoles: number,
  maxRPM: number,
  ri: number
): {
  seconds: number;
  secondsFull: number;
  softSeconds: number;
  rpm: number;
  joules: number;
  amps: number;
} {
  if (throttle <= 0) {
    return {
      seconds: 0,
      secondsFull: 0,
      softSeconds: 0,
      rpm: 0,
      joules: 0,
      amps: 0,
    };
  }

  const timeConstant = getTimeConstant(kv, gearRatio, moi, torque, volts);
  const softStartTimeConstant = getSoftStartTimeConstant(timeConstant);
  const cutOverRPM = getCutOverRpm(magnetPoles, gearRatio);
  const stallAmps = getStallAmps(volts, ri);

  // const prevOutput = getWeaponAtThrottle(
  //   throttle - 1,
  //   kv,
  //   gearRatio,
  //   moi,
  //   torque,
  //   volts,
  //   magnetPoles,
  //   maxRPM,
  //   ri
  // );
  const prevOutput = {
    seconds: 0,
    secondsFull: 0,
    softSeconds: 0,
    rpm: 0,
    joules: 0,
    amps: 0,
  };
  console.log( {timeConstant,softStartTimeConstant, throttle,cutOverRPM, stallAmps},prevOutput);

  const secondsFull = -(timeConstant * Math.log(1 - throttle)); //  -($B$2*LN(1-F6))

  const prevSecondsFull = prevOutput.secondsFull;
  const gain = secondsFull - prevSecondsFull; //diff prev secondsFull and this secondsFull  in the spreadsheet

  const softSeconds = -(softStartTimeConstant * Math.log(1 - throttle));
  const prevSoftSeconds = prevOutput.softSeconds;
  const gain2 = softSeconds - prevSoftSeconds; // diff prev seconds and this seconds  in the spreadsheet  //D6-D5

  const outputRPM = maxRPM * throttle;
  const prevOutputRPM = prevOutput.rpm;
  // TODO: Figure out what to do with the relative values.
  const prevOutputSeconds = prevOutput.seconds;

  const outputSeconds =
    prevOutputRPM < cutOverRPM
      ? prevOutputSeconds + gain2
      : prevOutputSeconds + gain;

  const outputJoules = 0.5 * moi * Math.pow(outputRPM * 0.105, 2);
  const outputAmps =
    outputRPM < cutOverRPM
      ? ((1 - throttle) * stallAmps) / (1 / POWER_MAX)
      : (1 - throttle) * stallAmps;

  return {
    seconds: outputSeconds,
    secondsFull,
    softSeconds,
    rpm: outputRPM,
    joules: outputJoules,
    amps: outputAmps,
  };
}
