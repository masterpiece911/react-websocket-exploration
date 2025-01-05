// types.d.ts

export interface WebSocketDataMap {
  "ws://localhost:8080/A": { value: number };
  "ws://localhost:8080/B": { value: number };
  "ws://localhost:8080/C": { value: number };
  // Add more sources and types as needed
}

export type WebSocketDataSource = {
  [K in keyof WebSocketDataMap]: K;
}[keyof WebSocketDataMap];

export type WebSocketStatus<T> =
  | { status: "INITIAL" }
  | { status: "OK"; data: T }
  | { status: "UNPARSEABLE"; raw: string }
  | { status: "CRC_FAILED"; data: T };
