import convert from 'convert';
import Qty from 'js-quantities';
import { ComputedGyroValues } from '.';
import {
  kgToNewtons,
  RadPerSec,
  radsToRPM,
  radsToSecPerRev,
  rpmToRads,
} from './convertUnits';

/** M is the resulting moment applied to the chassis measured in Newton-meters. With a standard vertically spinning weapon, when turning left, the right wheel will raise. When turning right, the left wheel will raise.*/
function calcM({
  moiKgm2,
  weaponRads,
  botRads,
}: {
  moiKgm2: number; //I
  weaponRads: number; //w1
  botRads: number; //w
}) {
  /**
   *  I is the mass moment of inertia of the spinning weapon system, measured in kg⋅m2.
   *  w1 and w2 are the rotational velocities of the weapon and the turning robot in the units of radians/second. It does not matter which label you use for which speed. To convert the RPM of your weapon to radians/second, use this formula: w = (RPM × Pi) ÷ 30
   *  M is the resulting moment applied to the chassis measured in Newton-meters. With a standard vertically spinning weapon, when turning left, the right wheel will raise. When turning right, the left wheel will raise.
   */
  return moiKgm2 * weaponRads * botRads;
}

interface CalcSpinParams {
  driveRPM: number;
  wheelOdMeter: number;
  widthMeter: number;
}
/**  Returns how fast your robot is rotating, in radians/second. */
function calcSpin({
  driveRPM,
  wheelOdMeter,
  widthMeter,
}: CalcSpinParams): RadPerSec {
  const spinRadPerSec = (driveRPM * wheelOdMeter * Math.PI) / (widthMeter * 30);


  return spinRadPerSec;
}

interface ForceOnWheelParams {
  weaponRads: RadPerSec;
  moiKgm2: number;
  spinRateRads: RadPerSec;
  weight: number;
  widthMeter: number;
}
/** Returns the Force on the raising wheel  */
function calcForceOnWheel({
  weaponRads,
  spinRateRads,
  moiKgm2,
  weight,
  widthMeter,
}: ForceOnWheelParams) {
  const moment = weaponRads * spinRateRads * moiKgm2;

  const force = (weight * widthMeter) / 2 - moment / 2;
  return force;
}

interface FullTurnParams {
  weight: number;
  moiKgm2: number;
  widthMeter: number;
  weaponRads: number;
}
/**
 *
 * To figure out the force on the raising wheel (this would normally be a positive number equal to half your robots weight) use this formula:
 * Force = ( Weight × L ÷ 2 ) - ( M ÷ 2 )
 * If this force is negative the wheel will lift. If the arena surface is magnetic, the lifting force may be countered by chassis magnets located near the wheels. The magnetic force must equal or exceed the gyroscopic lifting force to be effective.
 * s
 */
function calcFullTurn({
  weight,
  moiKgm2,
  widthMeter,
  weaponRads,
}: FullTurnParams) {
  var maxRot = (weight * widthMeter) / (moiKgm2 * weaponRads);
  return maxRot;
}

interface CalcComputedGyroValuesParams {
  driveRPM: number;
  weaponRPM: number;
  weaponMOI: number; //kg·m²
  wheelOdMeter: number; //mmeter
  widthMeter: number; //meter
  botMassKg: number; //kg
}
export const calcComputedGyroValues = ({
  driveRPM,
  weaponRPM,
  wheelOdMeter,
  widthMeter,
  weaponMOI,
  botMassKg,
}: CalcComputedGyroValuesParams): ComputedGyroValues => {
  // const widthMeter = Qty(width, 'mm').to('meter').scalar;
  const weight = kgToNewtons(botMassKg);

  console.log("calcComputedGyroValues",{driveRPM,
    weaponRPM,
    wheelOdMeter,
    widthMeter,
    weaponMOI,
    botMassKg,})
  const weaponRads = rpmToRads(weaponRPM);
  const spinRateRadSec = calcSpin({ driveRPM, wheelOdMeter, widthMeter });
  const forceOnWheel = calcForceOnWheel({
    weight,
    moiKgm2: weaponMOI,
    spinRateRads: spinRateRadSec,
    weaponRads,
    widthMeter,
  });

  const fullTurnRadSec = calcFullTurn({
    moiKgm2: weaponMOI,
    weaponRads,
    weight,
    widthMeter,
  });



  return {
    $forceOnRaisingWheel: forceOnWheel,
    $maxFlatTurnRate: radsToSecPerRev(fullTurnRadSec),
    $maxSpinRate: radsToSecPerRev(spinRateRadSec),
  };
};

// function calculate() {
//   // rpm2 = driveOutput RPM
//   // rpm = weapon RPM
//   // radians1 = weapon Rad/Sec
//   var radians1 = (Number(rpm.value) * Pi) / 30;

//   var radians2 =
//     (Number(rpm2.value) * Number(wheel.value) * Pi * 0.001) /
//     (0.03 * Number(width.value));

//   var botrot = (radians2 * 30) / Pi;
//   var botturn = 1 / (botrot / 60);

//   spin.value = botturn.toPrecision(2);

//   var moment = radians1 * radians2 * Number(mmi.value);

//   var weight = Number(mass.value) * 9.8;

//   var force2 = (weight * 0.001 * Number(width.value)) / 2 - moment / 2;

//   force.value = force2.toPrecision(3);

//   var maxrot =
//     (weight * Number(width.value) * 0.001) / (Number(mmi.value) * radians1);
//   var maxrpm = (maxrot * 30) / Pi;
//   var fullturn = 1 / (maxrpm / 60);

//   full.value = fullturn.toPrecision(2);
// }
