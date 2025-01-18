import React, { useEffect, useRef } from 'react';
import { WebsocketContext, WebsocketManager } from './websocket.ts';

type Props = {
  url: string;
  children: React.ReactNode;
}

export const WebsocketProvider: React.FC<Props> = ({ url, children }) => {
  const managerRef = useRef<WebsocketManager | null>(null);

  useEffect(() => {
    const websocketManager = new WebsocketManager(url);
    managerRef.current = websocketManager;

    return () => {
      websocketManager.close()
    }
  }, [url]);

  return (
    <WebsocketContext.Provider value={managerRef.current}>
      {children}
    </WebsocketContext.Provider>
  )
}
