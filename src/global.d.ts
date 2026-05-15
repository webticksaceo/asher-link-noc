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

// Declaration for the built server bundle so TypeScript doesn't complain
declare module "../dist/server/index.js" {
  const value: any;
  export default value;
}
