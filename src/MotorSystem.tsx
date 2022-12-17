import { getStore, MotorSystem } from "./store"
import {round} from 'lodash'

export const MotorSystemModule: React.FC<{
  title: string,
  system: MotorSystem,
  onUpdate: (key: keyof MotorSystem, value: number) => void
}> = ({ title, system, onUpdate }) => {
  return <div>
    <h3>{title}</h3>
    <h4>Battery</h4>
    <label>
      Lipo Cells
      <input type="number" min={1} max={12} value={system.batCells} onChange={e => {
        onUpdate('batCells', parseInt(e.target.value))
      }}
        style={{ width: 100 }} />
    </label>
    <br />
    Volts: {system.batVolts}v
    <br />
    <h4>Motor</h4>
    <label>
      Number of Motors
      <input type="number" step={1} min={0} value={system.motorCount} onChange={e => {
        onUpdate('motorCount', parseInt(e.target.value))
      }} style={{ width: 100 }} />
    </label>
    <br />
    <label>
      Kv
      <input type="number" step={50} min={50} value={system.motorKv} onChange={e => {
        onUpdate('motorKv', parseInt(e.target.value))
      }} style={{ width: 100 }} />
    </label>
    <br />
    <label>
      Watts (@{system.batCells}s)
      <input type="number" min={1} value={round(system.motorWatts)} onChange={e => {
        onUpdate('motorWatts', parseInt(e.target.value))
      }} style={{ width: 100 }} />
    </label><br />
    <label>
      Amps (@{system.batCells}s)
      <input type="number" min={1} value={round(system.motorAmps)} onChange={e => {
        onUpdate('motorAmps', parseInt(e.target.value))
      }} style={{ width: 100 }} />
    </label>

  </div>
}