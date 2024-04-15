import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
// import utc from "dayjs/plugin/utc";

// 注册插件
dayjs.extend(duration);
// dayjs.extend(utc);

/** 对比时间长度
 * @param {number} start
 * @param {number} end
 * @param {string} format HH:mm:ss
 * @returns {string}
 */

export function formatDiffDuration(start, end, format) {
  return dayjs.duration(end - start).format(format);
}

/** 将时间戳格式化为指定格式
 * @param {number} timestamp
 * @param {string} format HH:mm:ss
 * @returns {string}
 */

export function formattedDate(timestamp, format) {
  return dayjs(timestamp).format(format);
}

/** 日期转换时间戳
 * @param {string} time
 * @returns {number}
 */
export function toUnix(time) {
  return dayjs(time).valueOf();
}

/** 获取前某个月的日期
 * @param {number} n 相隔当前的月数 正数在当前之后 负数在之前
 * @param {string} format YYYY-MM-DD
 * @returns {string}
 */
export function getMonthDate(n, format) {
  return dayjs().add(n, "month").format(format);
}
