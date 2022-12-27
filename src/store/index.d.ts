export type BotId = string;

export type Joules = number;

export interface GeneralBotProperties {
  wheelBaseWidth: number;
  botMass: number;
}
export interface ComputedGyroValues {
  /** 'Max Robot Spin Rate' is the quickest the robot can rotate 360 degrees, spinning in place with negligible turning friction. */
  $maxSpinRate: number;
  /**
   * 'Force on Raising Wheel' with no gyro effect would be half the weight of your robot.
   *  - If the value is positive the robot can spin at full speed without wheel lift.
   *  - If the value is close to zero one wheel will have very little traction in a high-rate turn.
   *  - If the value is negative one wheel may lift off the floor in a full-speed spin.
   */
  $maxFlatTurnRate: number;
  /** 'Max Flat Turn Rate' is the quickest the robot is able to rotate 360 degrees without wheel lift. You may restrict the turning rate of your robot by setting a 'Dual Rate', 'ATV', or 'Travel Adjust' on your R/C transmitter. Consult your radio manual for details. */
  $forceOnRaisingWheel: number;
}
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
  $driveTotalReduction: number;
  $driveOutputRPM: number;
  $driveMotorStallTorque: number;
  $driveFullSendAmps: number;
  $driveFullSendWattHours: number;
  $driveFullSendAmpHours: number;
  $driveFullSendSpeed: number;
  $driveTypicalAmps: number;
  $driveTypicalWattHours: number;
  $driveTypicalAmpHours: number;
  $driveTypicalSpeed: number;

}

export type Bot = GeneralBotProperties &
  BatterySystem &
  WeaponSystem &
  DriveSystem & {
    id: BotId;
    name: string;
  };

export type ComputedBot = Bot &
  ComputedGyroValues &
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
  duplicateBot:(botId:BotId)=>void
}
