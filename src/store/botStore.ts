import Qty from 'js-quantities';
import { nanoid } from 'nanoid';
import name from 'project-name-generator';
import create from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { Bot, BotStore, ComputedDriveSystem, ComputedGyroValues, ComputedWeaponSystem } from '.';
import { calcComputedGyroValues } from './calcComputedGyroValues';
import { c, convertGmm2ToKgm2 } from './convertUnits';
import { calcComputedDrive as calcComputedDriveValues, calcComputedWeapon as calcComputedWeaponValues } from './utils';
export const VOLTS_PER_CELL = 3.7;

const blankBot: Bot = {

  id: 'id',
  name: 'name',
  aBatteryCells: 3,
  wheelBaseWidth: 0,
  botMass:0,
  weaponGearDriver: 1,
  weaponGearDriven: 1,
  weaponOd: 100,
  weaponMoi: 100000,
  weaponMotorCount: 1,
  weaponMotorPoles: 14,
  weaponMotorKv: 2000,
  weaponMotorWatts: 1,
  weaponMotorAmps: 1,
  weaponMotorRiMilliOhm: 20,
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


            const computedWeaponValues: ComputedWeaponSystem = calcComputedWeaponValues(bot, $aBatteryVolts)

            const computedDriveValues: ComputedDriveSystem = calcComputedDriveValues(bot, $aBatteryVolts)


            const $aBatteryEstimatedAmpHours =
              computedWeaponValues.$weaponFullSendAmpHours +
              computedWeaponValues.$weaponTypicalAmpHours +
              (computedDriveValues.$driveFullSendAmpHours +
                computedDriveValues.$driveTypicalAmpHours);

            const computedGyroValues: ComputedGyroValues = calcComputedGyroValues({
              // botMassKg: Qty(bot.botMass, 'g').to('kg').scalar,
              botMassKg:c(bot.botMass??1,'g','kg'),
              driveRPM: computedDriveValues.$driveOutputRPM,
              weaponMOI: convertGmm2ToKgm2(bot.weaponMoi),
              weaponRPM: computedWeaponValues.$weaponRpm,
            wheelOdMeter: c(bot.driveWheelOD??1,'mm','m'),
              widthMeter: c(bot.wheelBaseWidth??1, 'mm','m')
            });

            return {
              ...bot,
              $aBatteryVolts,
              $aBatteryEstimatedAmpHours,
              ...computedDriveValues,
              ...computedWeaponValues,
              ...computedGyroValues
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
          duplicateBot: botId => {
            const orgBot = get().bots[botId]
            if (!orgBot) {
              throw new Error('Duplicate Failed, bot Id  not found');
            }

            const id = nanoid();
            const bot = {
              ...orgBot,
              id,
              name: orgBot.name+" Copy",
            };
            set((store) => ({ bots: { ...store.bots, [id]: bot } }));
            return id;
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
