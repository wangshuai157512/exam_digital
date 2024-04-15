import service from "./service";

import config from "./config";

const { defaultHeaders } = config;

const request = (option) => {
  const {
    url,
    method,
    params,
    data,
    headersType,
    responseType,
    isLoading = false
  } = option;
  return service.request({
    url: url,
    method,
    params,
    data,
    isLoading,
    responseType: responseType,
    headers: {
      "Content-Type": headersType || defaultHeaders
    }
  });
};

export default {
  get: (option) => {
    return request({ method: "get", ...option });
  },
  post: (option) => {
    return request({ method: "post", ...option });
  },
  delete: (option) => {
    return request({ method: "delete", ...option });
  },
  put: (option) => {
    return request({ method: "put", ...option });
  },
  cancelRequest: (url) => {
    return service.cancelRequest(url);
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest();
  }
};
