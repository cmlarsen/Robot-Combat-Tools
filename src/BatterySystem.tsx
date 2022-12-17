
import produce from "immer"

import { BearState,Bot, BotId, setStore, useStore } from "./store"



export const BatterySystem: React.FC<{

  botId: BotId
}> = ({ botId }) => {
  const battery = useStore(store => store.bots[botId].batterySystem)
  return <div>
    <h2>Battery</h2>
    <form>
      <label>
        <span>Cells: </span>
        <input type="number" min="1" max="12" step="1"
          value={battery.primary.cells}
          onChange={({ target: { value } }) => {
            setStore(produce((store: BearState) => {
              store.bots[botId].batterySystem.primary.cells = parseInt(value)
            }))
          }} />
      </label>
      <p>
      <span>Volts</span>
        {battery.primary.volts}
      </p>
    </form>
  </div>

}