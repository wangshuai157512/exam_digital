export const getWebRtcRtspUrl = function ({ tdh, wldz, yhm, mm }, type) {
  // 设备类型
  const tdhs = tdh - 32;

  if (type === "W" || type === "S") {
    return `rtsp://${yhm}:${mm}@${wldz}:554/h264/ch${tdhs}/main/av_stream`;
  } else if (type === "Y") {
    return `rtsp://${yhm}:${mm}@${wldz}:554/Streaming/Unicast/channels/${tdhs}01`;
  } else {
    return null;
  }
};
