// WebSocketManager.ts
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketStatus,
} from "./types";
import { crcCheck } from "./crcCheck";

class WebSocketManager {
  private connections = new Map<WebSocketDataSource, WebSocket>();
  private listeners = new Map<
    WebSocketDataSource,
    Set<(status: WebSocketStatus<any>) => void>
  >();
  public latestData: Partial<
    Record<WebSocketDataSource, WebSocketStatus<any>>
  > = {};

  // Track intentional disconnects
  private disconnectIntent = new Map<WebSocketDataSource, boolean>();

  subscribe<T extends WebSocketDataSource>(
    source: T,
    callback: (status: WebSocketStatus<WebSocketDataMap[T]>) => void,
  ): () => void {
    console.log(`subscribing callback ${callback} to source ${source}`);
    if (!this.listeners.has(source)) {
      this.listeners.set(source, new Set());
      this.latestData[source] = { status: "INITIAL" };
    }

    const sourceListeners = this.listeners.get(source)!;
    sourceListeners.add(callback);

    if (!this.connections.has(source)) {
      this.createConnection(source);
    }

    return () => this.unsubscribe(source, callback);
  }

  private createConnection<T extends WebSocketDataSource>(source: T) {
    const ws = new WebSocket(source);
    this.connections.set(source, ws);

    // Reset intentional disconnect flag
    this.disconnectIntent.set(source, false);

    ws.onmessage = (event) => {
      console.log(`received data on source ${source}`, {
        event,
        data: event.data,
      });
      const rawData = event.data;

      // Attempt JSON parse
      try {
        const parsedData: WebSocketDataMap[T] = JSON.parse(rawData);

        // Apply CRC check if needed
        const expectedCrc = "expected_crc_value"; // Placeholder - Replace with actual logic to retrieve expected CRC
        if (!crcCheck(rawData, expectedCrc)) {
          this.updateStatus(source, { status: "CRC_FAILED", data: parsedData });
          return;
        }

        this.updateStatus(source, { status: "OK", data: parsedData });
      } catch {
        this.updateStatus(source, { status: "UNPARSEABLE", raw: rawData });
      }
    };

    ws.onclose = () => {
      const isIntentional = this.disconnectIntent.get(source);
      if (!isIntentional) {
        // Attempt to reconnect only if the disconnect was unintentional
        setTimeout(() => {
          if (
            this.listeners.has(source) &&
            this.listeners.get(source)!.size > 0
          ) {
            this.createConnection(source);
          }
        }, 1000);
      } else {
        // Clear intentional disconnect flag after the connection is closed
        this.disconnectIntent.delete(source);
      }
    };
  }

  private updateStatus<T extends WebSocketDataSource>(
    source: T,
    status: WebSocketStatus<WebSocketDataMap[T]>,
  ) {
    console.log(`Received update on source ${source}`, { status });
    this.latestData[source] = status;
    this.notifyListeners(source, status);
  }

  private notifyListeners<T extends WebSocketDataSource>(
    source: T,
    status: WebSocketStatus<WebSocketDataMap[T]>,
  ) {
    const sourceListeners = this.listeners.get(source);
    console.log(`Notifying listeners for source ${source}`, {
      sourceListeners,
      connections: this.connections,
    });
    if (sourceListeners) {
      sourceListeners.forEach((callback) => callback(status));
    }
  }

  private unsubscribe<T extends WebSocketDataSource>(
    source: T,
    callback: (status: WebSocketStatus<WebSocketDataMap[T]>) => void,
  ) {
    console.log(`Unsubscribing listener ${callback} from source ${source}`);
    const sourceListeners = this.listeners.get(source);
    if (sourceListeners) {
      sourceListeners.delete(callback);
      if (sourceListeners.size === 0) {
        this.disconnect(source);
      }
    }
  }

  private disconnect<T extends WebSocketDataSource>(source: T) {
    console.log(`disconnecting from source ${source}`);
    // Set the intentional disconnect flag
    this.disconnectIntent.set(source, true);

    const ws = this.connections.get(source);
    if (ws) {
      // Check the readyState before attempting to close
      if (ws.readyState === WebSocket.CONNECTING) {
        // If still connecting, add an event listener to close when ready
        ws.addEventListener("open", () => {
          console.log("Closing websocket after establishing connection");
          ws.close();
        });
      } else if (ws.readyState === WebSocket.OPEN) {
        // Close the connection if already open
        console.log("Closing already connected websocket");
        ws.close();
      }

      // Remove the WebSocket from the connections map
      this.connections.delete(source);
      delete this.latestData[source];
    }
  }
}

const webSocketManager = new WebSocketManager();
export default webSocketManager;
