declare class WebSocketPair {
  constructor();
  readonly 0: WebSocket;
  readonly 1: WebSocket;
  readonly [index: number]: WebSocket;
}

declare global {
  const WebSocketPair: typeof WebSocketPair;
}

export {};
