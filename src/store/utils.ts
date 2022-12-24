import { clamp } from 'lodash';
import { Bot } from '.';

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

export function calcComputedDrive(bot: Bot, $aBatteryVolts: number) {
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

export function calcComputedWeapon(bot: Bot, $aBatteryVolts: number) {
  const $weaponGearRatio = bot.weaponGearDriven / bot.weaponGearDriver;
  const $weaponRpm = (bot.weaponMotorKv * $aBatteryVolts) / $weaponGearRatio;
  const $weaponTipSpeed = (bot.weaponOd * Math.PI * ($weaponRpm / 60)) / 1000;

  const $weaponFullSendAmps =
    bot.weaponMotorAmps * bot.weaponFullSendThrottle * bot.weaponMotorCount;
  const $weaponTypicalAmps =
    bot.weaponMotorAmps * bot.weaponTypicalThrottle * bot.weaponMotorCount;

  const $weaponMotorStallTorque = calcBrushlessTorque(
    $aBatteryVolts,
    bot.weaponMotorKv,
    bot.weaponMotorRiMilliOhm
  );

  const {
    // amps: $weaponFullSendAmps, // I don't really understand the battery calcs on the AA spreasheet.
    joules: $weaponEnergy,
    seconds: $weaponSpinUpTime,
  } = getWeaponAtThrottle({
    gearRatio: bot.weaponGearDriven / bot.weaponGearDriver,
    kv: bot.weaponMotorKv,
    magnetPoles: bot.weaponMotorPoles,
    maxRPM: $weaponRpm,
    moi: bot.weaponMoi,
    ri: bot.weaponMotorRiMilliOhm,
    throttle: 1, //full throttle
    torque: $weaponMotorStallTorque,
    volts: $aBatteryVolts,
  });
  const { seconds: $weaponFullSendSpinUpTime } = getWeaponAtThrottle({
    gearRatio: bot.weaponGearDriven / bot.weaponGearDriver,
    kv: bot.weaponMotorKv,
    magnetPoles: bot.weaponMotorPoles,
    maxRPM: $weaponRpm,
    moi: bot.weaponMoi,
    ri: bot.weaponMotorRiMilliOhm,
    throttle: bot.weaponFullSendThrottle,
    torque: $weaponMotorStallTorque,
    volts: $aBatteryVolts,
  });

  const {
    // amps: $weaponTypicalAmps,
    seconds: $weaponTypicalSpinUpTime,
  } = getWeaponAtThrottle({
    gearRatio: bot.weaponGearDriven / bot.weaponGearDriver,
    kv: bot.weaponMotorKv,
    magnetPoles: bot.weaponMotorPoles,
    maxRPM: $weaponRpm,
    moi: bot.weaponMoi,
    ri: bot.weaponMotorRiMilliOhm,
    throttle: bot.weaponTypicalThrottle,
    torque: $weaponMotorStallTorque,
    volts: $aBatteryVolts,
  });

  const $weaponFullSendWattHours =
    $weaponFullSendAmps *
    $aBatteryVolts *
    (bot.weaponFullSendDuration / 60 / 60);
  const $weaponFullSendAmpHours = $weaponFullSendWattHours / $aBatteryVolts;

  const $weaponTypicalWattHours =
    $weaponTypicalAmps * $aBatteryVolts * (bot.weaponTypicalDuration / 60 / 60);
  const $weaponTypicalAmpHours = $weaponTypicalWattHours / $aBatteryVolts;

  return {
    $weaponGearRatio,
    $weaponEnergy,
    $weaponRpm,
    $weaponSpinUpTime,
    $weaponTipSpeed,
    $weaponFullSendAmps,
    $weaponFullSendWattHours,
    $weaponFullSendAmpHours,
    $weaponFullSendSpinUpTime,
    $weaponTypicalAmps,
    $weaponTypicalWattHours,
    $weaponTypicalAmpHours,
    $weaponTypicalSpinUpTime,
    $weaponMotorStallTorque,
  };
}

export function rpmToRads(rpm: number) {
  const radPerSec = (rpm * 2 * Math.PI) / 60;
  return radPerSec;
}
export function radsToRPM(radPerSec: number) {
  const rpm = (radPerSec * 60) / (2 * Math.PI);
  return rpm;
}

export function convertGmm2ToKgm2(gmm2: number): number {
  // Convert g•mm^2 to kg•m^2 by dividing by 1,000,000
  const kgm = gmm2 * 0.000000001;
  return kgm;
  // return gmm2 / 1_000_000;
}

/**
 * Functions transferred from the Ask Aaron spreadsheet
 */

/** Commutation time in u-sec below which 'soft start' restriction is active. Default value: 1024 */
const COMMUTATION_MAX = 1024;
/**Maximum power pulse length during 'soft start'. PWR_MAX_RPM1 Default value: 25% */
const POWER_MAX = 0.25;

const _getTimeConstant = (
  kv: number,
  gearRatio: number,
  moi: number,
  torque: number,
  volts: number
) => {
  const r2 = ((((volts * kv) / gearRatio) * 0.105) / torque) * gearRatio * moi;

  return r2;
};

/**Time constant when ESC 'soft start' is active. */
const _getSoftStartTimeConstant = (timeConstant: number) => {
  return timeConstant * (1 / POWER_MAX);
};

/**Theoretical Stall Amps */
const _getStallAmps = (volts: number, ri: number) => {
  return (1000 * volts) / ri;
};

/** Weapon RPM where ESC 'soft start' cuts out. */
const _getCutOverRpm = (magnets: number, gearRatio: number) => {
  return 60 / (magnets * 3 * (COMMUTATION_MAX / 1000000)) / gearRatio;
};

type GetWeaponAtThrottleProps = {
  throttle: number;
  kv: number;
  gearRatio: number;
  moi: number;
  torque: number;
  volts: number;
  magnetPoles: number;
  maxRPM: number;
  ri: number;
};
type GetWeaponAtThrottleResult = {
  seconds: number;
  secondsFull: number;
  softSeconds: number;
  rpm: number;
  joules: number;
  amps: number;
};
export function getWeaponAtThrottle({
  throttle,
  kv,
  gearRatio,
  moi,
  torque,
  volts,
  magnetPoles,
  maxRPM,
  ri,
}: GetWeaponAtThrottleProps): GetWeaponAtThrottleResult {
  const moiKgm2 = convertGmm2ToKgm2(moi);
  // Clamp throttle to a range of 0 to 0.9973
  // It will result in infinity if allowed to go to 1
  const clampedThrottle = clamp(throttle, 0, 0.95);
  // Return early if throttle is 0
  if (clampedThrottle <= 0) {
    return {
      seconds: 0,
      secondsFull: 0,
      softSeconds: 0,
      rpm: 0,
      joules: 0,
      amps: 0,
    };
  }

  // Calculate time constant, soft start time constant, cut-over RPM, and stall amps
  const timeConstant = _getTimeConstant(kv, gearRatio, moiKgm2, torque, volts);
  const softStartTimeConstant = _getSoftStartTimeConstant(timeConstant);
  const cutOverRPM = _getCutOverRpm(magnetPoles, gearRatio);
  const stallAmps = _getStallAmps(volts, ri);

  // Calculate secondsFull and softSeconds
  const secondsFull = -(timeConstant * Math.log(1 - clampedThrottle));
  const softSeconds = -(softStartTimeConstant * Math.log(1 - clampedThrottle));

  // Calculate output RPM and seconds
  const outputRPM = maxRPM * clampedThrottle;
  const outputSeconds = outputRPM < cutOverRPM ? softSeconds : secondsFull;

  // Calculate output joules and amps
  const outputJoules = 0.5 * moiKgm2 * Math.pow(outputRPM * 0.105, 2);
  const outputAmps =
    outputRPM < cutOverRPM
      ? ((1 - throttle) * stallAmps) / (1 / POWER_MAX)
      : (1 - throttle) * stallAmps;

  // Return all calculated values
  return {
    seconds: outputSeconds,
    secondsFull,
    softSeconds,
    rpm: outputRPM,
    joules: outputJoules,
    amps: outputAmps,
  };
}
