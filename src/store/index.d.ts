export type BotId = string;

export type Joules = number;

export interface BatterySystem {
  aBatteryCells: number;
}
export interface ComputedBatterySystem {
  $aBatteryVolts: number;
  $aBatteryEstimatedAmpHours: number;
}

export interface WeaponSystem {
  weaponGearDriver: number;
  weaponGearDriven: number;
  weaponOd: number;
  weaponMoi: number;
  weaponMotorCount: number;
  weaponMotorPoles: number;
  weaponMotorKv: number;
  weaponMotorWatts: number;
  weaponMotorAmps: number;
  weaponMotorRiMilliOhm: number;
  weaponFullSendThrottle: number;
  weaponFullSendDuration: number;
  weaponTypicalThrottle: number;
  weaponTypicalDuration: number;
}

export interface ComputedWeaponSystem {
  $weaponEnergy: number;
  $weaponRpm: number;
  $weaponMotorStallTorque: number;
  $weaponSpinUpTime: number;
  $weaponTipSpeed: number;
  $weaponGearRatio: number;
  $weaponFullSendAmps: number;
  $weaponFullSendWattHours: number;
  $weaponFullSendAmpHours: number;
  $weaponFullSendSpinUpTime: number;
  $weaponTypicalAmps: number;
  $weaponTypicalWattHours: number;
  $weaponTypicalAmpHours: number;
  $weaponTypicalSpinUpTime: number;
}

export interface DriveSystem {
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

export interface ComputedDriveSystem {
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

export type Units = 'metric' | 'imperial';

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
