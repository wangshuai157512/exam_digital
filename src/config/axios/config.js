import qs from "qs";
import { ElLoading, ElMessage } from "element-plus";
import { getToken, removeToken } from "@/utils/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_PATH;

let loadingInstance;
const config = {
  /**
   * api请求基础路径
   */
  baseUrl: {
    // 开发环境接口前缀
    base: BASE_URL, // "http://10.0.9.77:10031",

    // 打包开发环境接口前缀
    dev: "/",

    // 打包生产环境接口前缀
    pro: BASE_URL, // http://192.168.153.234:9033

    // 打包测试环境接口前缀
    test: ""
  },

  /**
   * 接口成功返回状态码
   */
  code: 200,

  /**
   * 接口请求超时时间
   */
  timeout: 60000,

  /**
   * 默认接口请求类型
   * 可选值：application/x-www-form-urlencoded multipart/form-data
   */
  defaultHeaders: "application/json",

  interceptors: {
    //请求拦截
    // requestInterceptors: (config) => {
    //   return config
    // },
    // 响应拦截器
    // responseInterceptors: (result: AxiosResponse) => {
    //   return result
    // }
  }
};

const defaultRequestInterceptors = (config) => {
  const { isLoading } = config;
  const token = getToken();
  const noTokenPath = ["/oauth/login/exam/v4.0"]; // 不携带请求头的路径

  if (isLoading) {
    loadingInstance = ElLoading.service({
      fullscreen: true,
      background: "rgba(122, 122, 122, 0)"
    });
  }

  if (token && token !== "undefined" && !noTokenPath.includes(config.url)) {
    config.headers["Authorization"] = token;
  }

  if (
    config.method === "post" &&
    config.headers["Content-Type"] === "application/x-www-form-urlencoded"
  ) {
    config.data = qs.stringify(config.data);
  }

  if (config.method === "get" && config.params) {
    let url = config.url;
    url += "?";
    const keys = Object.keys(config.params);
    for (const key of keys) {
      if (config.params[key] !== void 0 && config.params[key] !== null) {
        url += `${key}=${encodeURIComponent(config.params[key])}&`;
      }
    }
    url = url.substring(0, url.length - 1);
    config.params = {};
    config.url = url;
  }
  return config;
};
(error) => {
  console.log(error);
  Promise.reject(error);
};

const defaultResponseInterceptors = (response) => {
  loadingInstance?.close();
  if (response?.config?.responseType === "blob") {
    // 如果是文件流，直接过
    return response;
  } else if (response.code === config.code) {
    return response.data;
  } else if (response.code === 401) {
    removeToken();
    location.href = "/";
  } else {
    ElMessage.error(response.msg || "网络连接异常");
  }
};
(error) => {
  console.log("err" + error); // for debug
  ElMessage.error(error.message || "网络连接异常");
  return Promise.reject(error);
};

export { defaultResponseInterceptors, defaultRequestInterceptors };
export default config;
