import { webMessagePort, webglMessagePort } from "./createchannel";

export const channel = (app) => {
  // 将webgl通信端口挂载window下
  window.webglMessagePort = webglMessagePort;
  // 将web通信端口挂载app config下
  app.config.globalProperties.webMessagePort = webMessagePort;
};
