
import { round } from "lodash"
import { MotorSystem, MotorSystemName, ThrottleLevel } from "./store"


export const ThrottleModule: React.FC<{
  systemName: MotorSystemName,
  onUpdate: (index: number, key: keyof ThrottleLevel, value: any) => void,
  throttleLevels: ThrottleLevel[]
}> = ({ throttleLevels, systemName, onUpdate }) => {


  return <div>{throttleLevels.map((level, index) => {
    return <div key={index}>

      {level.label}
      <br />
      <label>
        Throttle Percentage: {round(level.percentage * 100)}%
        <input
          type="range"
          name="throttle"
          min="0"
          max="100"
          step="1"
          value={level.percentage * 100}
          onChange={e => {
            onUpdate(index, 'percentage', parseInt(e.target.value) / 100)
          }}
        />
      </label>
      <br />
      <label>
        Seconds {level.secondsSpent}
        <input
          type="range"
          name="seconds"
          min="0"
          max="180"
          step="1"
          value={level.secondsSpent}
          onChange={e => {

            onUpdate(index, 'secondsSpent', parseInt(e.target.value))
          }}
        />
      </label>
    </div>
  })}
  </div>

}