import axios from "axios";
import config, {
  defaultRequestInterceptors,
  defaultResponseInterceptors
} from "./config";

const { interceptors, baseUrl } = config;
const isDev = import.meta.env.DEV;
export const PATH_URL = baseUrl[isDev ? "base" : "pro"];
const { requestInterceptors, responseInterceptors } = interceptors;

const abortControllerMap = new Map();

const axiosInstance = axios.create({
  ...config,
  baseURL: PATH_URL
});

axiosInstance.interceptors.request.use((req) => {
  const controller = new AbortController();
  const url = req.url || "";
  req.signal = controller.signal;
  abortControllerMap.set(url, controller);
  return req;
});

axiosInstance.interceptors.response.use(
  (res) => {
    const url = res.config.url || "";
    abortControllerMap.delete(url);
    return res.data;
  },
  (err) => err
);

axiosInstance.interceptors.request.use(
  requestInterceptors || defaultRequestInterceptors
);
axiosInstance.interceptors.response.use(
  responseInterceptors || defaultResponseInterceptors
);

const service = {
  request: (config) => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config);
      }

      axiosInstance
        .request(config)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  cancelRequest: (url) => {
    const urlList = Array.isArray(url) ? url : [url];
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort();
      abortControllerMap.delete(_url);
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort();
    }
    abortControllerMap.clear();
  }
};

export default service;
