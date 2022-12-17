import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { round } from 'lodash'
import { nanoid } from "nanoid"
import produce from 'immer'

export const VOLTS_PER_CELL = 3.7;
type Seconds = number

export interface ThrottleLevel {
  label: string,
  percentage: number,
  secondsSpent: Seconds
}

// TODO move battery to own spot in store
export interface Battery {
  cells: number,
  volts: number,
  c: number,
  label: string,
  url: string | undefined
}


export interface Motor {
  motorKv: number
  motorWatts: number
  motorRPM: number
  motorAmps: number
  motorPoles?:number,
  motorResistance?:number
}

// TODO
export interface DriveSystem extends Motor {
  primaryReduction:number
  secondaryReduction:number
  wheelOD:number,
  speed:number,
  motorCount: number
  batteryId:string,
}

// TODO
export interface WeaponSystem extends Motor {
  motorCount: number,
  batteryId:string,
  gearReduction:number,
  weaponMOI:number,
  weaponOD:number,
}

  /** @deprecated */
// export interface MotorSystem extends Motor {
//   batCells: number
//   batVolts: number
//   motorCount: number
// }

export interface Bot {
  id: string,
  name: string,
  drive: DriveSystem,
  weapon: WeaponSystem,
  throttleLevels: Record<SystemName, ThrottleLevel[]>
}

export type SystemName = 'drive' | 'weapon'


const blankBot: Omit<Bot, 'id' | 'name'> = {
  drive: {
    batCells: 1,
    batVolts: VOLTS_PER_CELL,
    motorCount: 0,
    motorKv: 0,
    motorWatts: 0,
    motorRPM: 0,
    motorAmps: 0,
  },
  weapon: {
    batCells: 1,
    batVolts: VOLTS_PER_CELL,
    motorCount: 0,
    motorKv: 0,
    motorWatts: 0,
    motorRPM: 0,
    motorAmps: 0,
  },

  throttleLevels: {
    drive: [{
      label: "Full Speed",
      percentage: 1,
      secondsSpent: 20
    },
    {
      label: "Steady State",
      percentage: .5,
      secondsSpent: 120
    }],
    weapon: [{
      label: "Full Speed",
      percentage: 1,
      secondsSpent: 20
    },
    {
      label: "Steady State",
      percentage: .5,
      secondsSpent: 120
    }],

  }
}


interface BearState {

  activeBotId: string | undefined
  bots: Record<string, Bot>
  createBot: (name: string) => string
  deleteBot: (id: string) => void
  updateMotorSystem: (id: string, system: MotorSystemName, key: keyof MotorSystem, value: number) => void
  updateThrottleLevels: (id: string, system: MotorSystemName, index: number, key: keyof ThrottleLevel, value: any) => void
}

/**
TODO: break out battery, allow selecting battery for motors
TODO: Add ability to add more Throttle States
*/

export const useStore = create<BearState>()(
  devtools(
    persist(

      (set, get, api) => {

        return {

          activeBotId: undefined,
          bots: {},
          createBot: (name) => {
            const id = nanoid()
            const newBot = { ...blankBot, id, name: name }
            set({ bots: { ...get().bots, [id]: newBot } })
            return id
          },
          deleteBot: id => {
            const newBots = { ...get().bots }
            delete newBots[id]
            set({ bots: newBots })
          },

          updateMotorSystem: (id, system, key, value) => {
            set(
              produce((state: BearState) => {
                const prevCells = state.bots[id][system].batCells
                const sys = { ...state.bots[id][system], [key]: value };
                const batVolts = volts(sys.batCells)

                state.bots[id][system] = {
                  ...sys,
                  // Update the computed vals
                  batVolts,
                  motorRPM: sys.motorKv * batVolts,
                  motorWatts: key === 'batCells' ?
                    (sys.motorWatts / prevCells) * sys.batCells :
                    key === 'motorAmps' ? watts(sys.motorAmps, sys.batCells) :
                      sys.motorWatts,
                  motorAmps: key === 'batCells' ?
                    (sys.motorAmps / prevCells) * sys.batCells :
                    key === 'motorWatts' ? amps(sys.motorWatts, sys.batCells) :
                      sys.motorAmps
                }
              })
            )
          },
          updateThrottleLevels: (id, system, index, key, value) => {
            set(produce((state: BearState) => {
              state.bots[id].throttleLevels[system][index][key] = value
            }))
          }
        }
      },
      {

        name: 'store-storage',

      }
    )
  )
)

export const setStore = useStore.setState
export const getStore = useStore.getState
export const volts = (cells: number) => round(cells * VOLTS_PER_CELL, 2)
export const amps = (watts: number, cells: number) => watts / volts(cells)
export const watts = (amps: number, cells: number) => amps * volts(cells)
export const rpm = (kv: number, cells: number) => kv * volts(cells);