import {
  webSocketSendMessagePort,
  webSocketRecMessagePort
} from "./createchannel";

const ws = new WebSocket("ws://10.0.9.251:16009");
ws.onmessage = function (e) {
  webSocketSendMessagePort.postMessage(e.data);
};

export { webSocketRecMessagePort };
