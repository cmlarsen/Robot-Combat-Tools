import React, { ReactElement } from 'react';
import { getBotStore } from '../botStore';

interface Props {}

export default function CreateBotButton({}: Props): ReactElement {
  return (
    <button
      onClick={() => {
        getBotStore().selectBot(getBotStore().createBot());
      }}
    >
      Create bot
    </button>
  );
}
