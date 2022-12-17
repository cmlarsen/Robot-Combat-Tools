import { useState } from 'react'
import { AddBot } from './AddBot';
import './BotCalc.css'
import { BotList } from './BotList';
import { MotorSystemModule } from './MotorSystem';
import { Motor, amps, getStore, setStore, useStore, volts, VOLTS_PER_CELL } from './store';
import { ThrottleModule } from './ThrottleModule';


export default function BotCalc() {
  const store = useStore();
  const botList = useStore(store => store.bots)
  const activeBot = store.activeBotId ? store.bots[store.activeBotId] : undefined
  const editName = (name: string) => {
    if (!activeBot?.id) {
      return
    }
    setStore(store => ({
      bots: {
        [activeBot.id]: {
          ...store.bots[activeBot.id],
          name: name
        }
      }
    }))
  }

  return (
    <main>
      <h3>Bots</h3>
      <AddBot />
      <BotList />

      {JSON.stringify(activeBot)}
      {activeBot &&
        <form onSubmit={(event) => {
          console.log("Submitted")
          event.preventDefault();
        }}>
          <input value={activeBot?.name} onChange={({ target: { value } }) => editName(value)} />
          <hr />
          <MotorSystemModule title={"Weapon"} system={activeBot.weapon} onUpdate={(key, value) => {
            getStore().updateMotorSystem(activeBot.id, 'weapon', key, value)
          }} />
          <ThrottleModule systemName={'weapon'} throttleLevels={activeBot.throttleLevels['weapon']} onUpdate={(index, key, value) => {
            getStore().updateThrottleLevels(activeBot.id, 'weapon', index, key, value)
          }} />
          <hr />
          <MotorSystemModule title={"Drive"} system={activeBot.drive} onUpdate={(key, value) => {
            getStore().updateMotorSystem(activeBot.id, 'drive', key, value)
          }} />
          <ThrottleModule systemName={'drive'} throttleLevels={activeBot.throttleLevels['drive']} onUpdate={(index, key, value) => {
            getStore().updateThrottleLevels(activeBot.id, 'drive', index, key, value)
          }} />
        </form>}
    </main>
  )
}