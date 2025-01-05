import ko from "knockout";
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketStatus,
} from "../../ws-manager/types";
import {
  getTextAfterLastSlash,
  isStringSource,
} from "../../common-client/sourceHelperFunctions";
import {
  WebSocketObservable,
  createWebSocketObservable,
} from "../../ws-manager/webSocketObservable";

function isCallback(func: unknown): func is () => void {
  return typeof func === "function" && func.length === 0;
}

export default class DataSection<S extends WebSocketDataSource> {
  connection: WebSocketObservable<S>;
  status: KnockoutComputed<WebSocketStatus<WebSocketDataMap[S]>["status"]>;
  data: KnockoutComputed<string>;
  text: KnockoutComputed<string>;
  source: string;
  onClose: () => void;

  constructor({ source, onClose }: { source: unknown; onClose: unknown }) {
    if (typeof source !== "string")
      throw new Error(
        `Expected a source as 'source' param in ws-data-section, but got ${source}`,
      );
    if (!isStringSource(source))
      throw new Error(
        `Expected a source as 'source' param in ws-data-section, but got ${source}`,
      );

    if (!isCallback(onClose))
      throw new Error(
        `Expected a handler function as 'onClose' param in ws-data-section, but got ${source}`,
      );

    this.connection = createWebSocketObservable(source);
    this.source = getTextAfterLastSlash(source);

    this.status = ko.pureComputed(() => {
      const newValue = this.connection().status
      return newValue;
    });

    this.data = ko.pureComputed(() => {
      const currentData = this.connection();
      if (currentData.status === "OK") {
        return `${currentData.data.value * 100}%`;
      } 
      return "0%";
    });

    this.text = ko.pureComputed(() => {
      const { status } = this.connection();
      const textMap: Record<
        WebSocketStatus<WebSocketDataMap[S]>["status"],
        string
      > = {
        INITIAL: "No data received yet",
        UNPARSEABLE: "Data unparseable",
        CRC_FAILED: "Data failed CRC",
        OK: "",
      };
      return textMap[status];
    });

    this.onClose = onClose;

    this.dispose.bind(this);
  }

  dispose() {
    this.connection.dispose();
  }
}
