/**
 * web视图页面与three3d场景通信
 */
const { port1: webMessagePort, port2: webglMessagePort } = new MessageChannel();

/**
 * 实时车载websoket协议与web视图页面和three3d场景通信
 */
const { port1: webSocketSendMessagePort, port2: webSocketRecMessagePort } =
  new MessageChannel();

export {
  webMessagePort,
  webglMessagePort,
  webSocketSendMessagePort,
  webSocketRecMessagePort
};
