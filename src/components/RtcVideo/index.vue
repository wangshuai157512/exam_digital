<script>
const srvUrl = import.meta.env.VITE_WEBRTC_SERVER;
// 事件列表
const eventList = [
  "creatdWebRtcServer",
  "loadeddata",
  "timeupdate",
  "canplay",
  "play",
  "pause",
  "error"
]; // 创建RtcServer成功、数据已加载、时长已改变、准备好开始播放、播放、暂停、播放错误
</script>
<script setup>
import "./webrtcstreamer";
import "./webrtcconfig";
import { onMounted, onBeforeUnmount } from "vue";
let webRtcServer;

// http://192.168.153.238:8000 http://10.0.9.77:8000

const emits = defineEmits(eventList);

// 创建webRtc
const creatWebRtcStreamer = function () {
  return new WebRtcStreamer("webRtcVideo", srvUrl);
};

// 添加事件
const addEventListener = function () {
  const webRtcVideo = document.querySelector("#webRtcVideo");

  eventList.forEach((event) => {
    webRtcVideo.addEventListener(event, (e) => {
      emits(event, e);
    });
  });
};

// 去除默认右点击事件
const removeDefaultEvent = function () {
  const webRtcVideo = document.querySelector("#webRtcVideo");

  webRtcVideo.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
};

onMounted(() => {
  webRtcServer = creatWebRtcStreamer();
  addEventListener();
  removeDefaultEvent();
  setTimeout(emits, 0, "creatdWebRtcServer", webRtcServer);
});

// 断开连接
onBeforeUnmount(() => {
  webRtcServer.disconnect();
});
</script>
<template>
  <video id="webRtcVideo" autoplay></video>
</template>
