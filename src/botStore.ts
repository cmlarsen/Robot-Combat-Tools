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
  weaponFullSendThrottle: 1,
  weaponFullSendDuration: 20,
  weaponTypicalThrottle: 0.5,
  weaponTypicalDuration: 160,
  driveMotorCount: 2,
  driveMotorKv: 2000,
  driveMotorWatts: 1,
  driveMotorAmps: 1,
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

            const $weaponGearRatio =
              bot.weaponGearDriven / bot.weaponGearDriver;
            const $weaponRpm =
              (bot.weaponMotorKv * $aBatteryVolts) / $weaponGearRatio;
            const $weaponTipSpeed =
              (bot.weaponOd * Math.PI * ($weaponRpm / 60)) / 1000;

            const kgm = bot.weaponMoi * 0.000000001;
            // const rads = convert($weaponRpm*60,'turns').to('rads')
            const rads = rpmToRads($weaponRpm);
            const $weaponEnergy = 0.5 * kgm * Math.pow(rads, 2);

            const $weaponFullSendAmps =
              bot.weaponMotorAmps * bot.weaponFullSendThrottle;
            const $weaponFullSendWattHours =
              $weaponFullSendAmps *
              $aBatteryVolts *
              (bot.weaponFullSendDuration / 60 / 60);
            const $weaponFullSendAmpHours =
              $weaponFullSendWattHours / $aBatteryVolts;

            const $weaponTypicalAmps =
              bot.weaponMotorAmps * bot.weaponTypicalThrottle;
            const $weaponTypicalWattHours =
              $weaponTypicalAmps *
              $aBatteryVolts *
              (bot.weaponTypicalDuration / 60 / 60);
            const $weaponTypicalAmpHours =
              $weaponTypicalWattHours / $aBatteryVolts;

            const computedWeapon: ComputedWeaponSystem = {
              $weaponGearRatio,
              $weaponEnergy,
              $weaponMotorStallTorque: -1,
              $weaponRpm,
              $weaponTipSpeed,
              $weaponSpinUpTime: -1,
              $weaponFullSendAmps,
              $weaponFullSendWattHours,
              $weaponFullSendAmpHours,
              $weaponTypicalAmps,
              $weaponTypicalWattHours,
              $weaponTypicalAmpHours,
            };

            const $driveFullSendAmps =
              (bot.driveMotorAmps * bot.driveFullSendThrottle)*bot.driveMotorCount;

            const $driveFullSendWattHours =
              ($driveFullSendAmps *
              $aBatteryVolts *
              (bot.driveFullSendDuration / 60 / 60));

            const $driveFullSendAmpHours =
              ($driveFullSendWattHours / $aBatteryVolts);

            const $driveTypicalAmps =
              (bot.driveMotorAmps * bot.driveTypicalThrottle)*bot.driveMotorCount;

            const $driveTypicalWattHours =
             ( $driveTypicalAmps *
              $aBatteryVolts *
              (bot.driveTypicalDuration / 60 / 60));

            const $driveTypicalAmpHours =
              ($driveTypicalWattHours / $aBatteryVolts);

            const $driveTopSpeed =
              (($aBatteryVolts * bot.driveMotorKv) /
                bot.driveGearboxReduction /
                bot.driveSecondaryReduction) *
              ((bot.driveWheelOD/1000 * Math.PI) / 60);

            const computedDrive: ComputedDriveSystem = {
              $driveTopSpeed,
              $driveFullSendAmps,
              $driveFullSendWattHours,
              $driveFullSendAmpHours,
              $driveTypicalAmps,
              $driveTypicalWattHours,
              $driveTypicalAmpHours,
            };

            const $aBatteryEstimatedCapacity =
              $weaponFullSendAmpHours +
              $weaponTypicalAmpHours +
              ($driveFullSendAmpHours + $driveTypicalAmpHours) ;

            return {
              ...bot,
              $aBatteryVolts,
              $aBatteryEstimatedAmpHours: $aBatteryEstimatedCapacity,
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

export function rpmToRads(rpm: number) {
  return rpm * 0.10472;
}
