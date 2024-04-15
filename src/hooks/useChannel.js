import { getCurrentInstance } from "vue";

export const useMessageChannel = () => {
  const { appContext } = getCurrentInstance();
  const { webMessagePort } = appContext.config.globalProperties;

  const stringify = JSON.stringify;

  return {
    webMessagePort,
    stringify
  };
};
