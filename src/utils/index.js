/** 解析url参数
 * @param {string} url
 * @returns {object}
 */
export function parseUrlParams(url) {
  var queryString = url.split("?")[1];
  var queryParams = queryString.split("&");
  var params = {};

  for (var i = 0; i < queryParams.length; i++) {
    var pair = queryParams[i].split("=");
    params[pair[0]] = pair[1];
  }

  return params;
}

/** YYYYMMDDTHHmmss[Z]转换时间戳
 * @param {string} time
 * @returns {number}
 */
export function utcTimestamp(dateString) {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hours = dateString.substring(9, 11);
  const minutes = dateString.substring(11, 13);
  const seconds = dateString.substring(13, 15);
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return new Date(formattedDateTime).getTime();
}
