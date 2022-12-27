import Qty from 'js-quantities';

export type RPM = number;
export type RadPerSec = number;
export function rpmToRads(rpm: number): RadPerSec {
  const radPerSec = (rpm * 2 * Math.PI) / 60;
  return radPerSec;
}
export function radsToRPM(radPerSec: RPM) {
  const rpm = (radPerSec * 60) / (2 * Math.PI);
  return rpm;
}

export function kgToNewtons(kg: number) {
  return kg * 9.8;
}
export function radsToSecPerRev(rads: RadPerSec): number {
  const rpm = radsToRPM(rads);
  return 1 / (rpm / 60);
}

export function c(value: number, from: string, to: Qty.UnitSource): number {
  return Qty(value, from).to(to).scalar;
}

export function convertGmm2ToKgm2(gmm2: number): number {
  // Convert g•mm^2 to kg•m^2 by dividing by 1,000,000
  const kgm = gmm2 * 0.000000001;
  return kgm;
  // return gmm2 / 1_000_000;
}
