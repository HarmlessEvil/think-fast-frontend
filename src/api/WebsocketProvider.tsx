import React, { useEffect, useState } from 'react';
import { WebsocketContext, WebsocketManager } from './websocket.ts';

type Props = {
  url: string;
  children: React.ReactNode;
}

export const WebsocketProvider: React.FC<Props> = ({ url, children }) => {
  const [manager, setManager] = useState<WebsocketManager | null>(null);

  useEffect(() => {
    const websocketManager = new WebsocketManager(url);
    setManager(websocketManager);

    return () => {
      websocketManager.close();
    };
  }, [url]);

  return (
    <WebsocketContext.Provider value={manager}>
      {children}
    </WebsocketContext.Provider>
  );
};
