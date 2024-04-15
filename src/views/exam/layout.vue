<script setup>
import { ref, watch, computed, onMounted } from "vue";
import NavHeader from "./header.vue";
import SideBar from "./sidebar.vue";
import FooterBtn from "./footer.vue";
import SideWarn from "./warn/index.vue";
import SideContent from "./sidecontent/index.vue";
import ModalBox from "../exam/modal.vue";
import ScreenView from "./sidecontent/components/ScreenView.vue";
import WebglIframe from "../exam/webgl.vue";
import PlayVideo from "../exam/play/index.vue";
import Warn from "./warn.vue";
import Shadow from "./shadow.vue";
import { playStore } from "@/store/modules/play";
import { examStore } from "@/store/modules/exam";
import { useMessageChannel } from "@/hooks/useChannel";
import { formattedDate } from "@/utils/day";

const count = ref(0);

const play = playStore();

const exam = examStore();

const examKcdd = unref(computed(() => exam.getExamKcdd));

const examKm = unref(computed(() => exam.getExamKm));

const playUrl = computed(() => play.getPlayUrl);

const playKey = computed(() => play.getPlayKey);

const playKsxh = computed(() => play.getPlayKsxh);

const playStartTime = computed(() => play.getPlayStartTime);

const playEndTime = computed(() => play.getPlayEndTime);

const isTrackPlayback = location.href.includes("trackPlayback");

// 给3d模型传入id
const { webMessagePort, stringify } = useMessageChannel();

const handleWebglLoaded = function () {
  if (isTrackPlayback) return;
  console.log(`初始化场景web端传入考场id:${examKcdd}-${examKm}`);
  webMessagePort.postMessage(
    stringify({
      type: "init",
      examAreaCode: `${examKcdd}-${examKm}`
    })
  );
};
/**-------------------------视频回放------------------------ */
// 创建连接成功
const handleCreatdConnect = function () {
  // 3d 传入3d回放视频参数
  const params = {
    type: "trackPlayback",
    examNo: ksxh,
    startTime,
    endTime,
    playState: true,
    isDrag: false // 是否拖动
  };
  webMessagePort.postMessage(stringify(params));
  console.log(`%cweb回放传入3d开始参数：${stringify(params)}`, "color: blue;");
};

const playVideoRef = ref();

const handleWebGlPlay = function () {
  console.log("webgl开始播放·");
  console.log(playVideoRef.value.webGlPlayed());
  // playVideoRef.value;
  // webGlPlayed();
  // console.log(document.getElementById("playVideoRef"));
};
// 播放
const handleVideoPlay = function ({ startTime, endTime }) {
  const formatStartTime = formattedDate(startTime, "YYYY-MM-DD HH:mm:ss");
  const formatEndTime = formattedDate(endTime, "YYYY-MM-DD HH:mm:ss");

  const params = {
    type: "changeTrackPlayback",
    examNo: playKsxh.value,
    startTime: formatStartTime,
    endTime: formatEndTime,
    playState: true,
    isDrag: false // 是否拖动
  };
  // 传入3d回放视频参数
  webMessagePort.postMessage(stringify(params));
  console.log(`%cweb回放传入3d开始参数：${stringify(params)}`, "color: blue;");
};

// 暂停
const handleVideoPause = function () {
  const params = {
    type: "changeTrackPlayback",
    playState: false
  };
  // 传入3d回放视频参数
  webMessagePort.postMessage(stringify(params));
  console.log(`%cweb回放传入3d开始参数：${stringify(params)}`, "color: blue;");
};

// 滑动进度条触发
const handleVideoChange = function ({ startTime, endTime }) {
  const formatStartTime = formattedDate(startTime, "YYYY-MM-DD HH:mm:ss");
  const formatEndTime = formattedDate(endTime, "YYYY-MM-DD HH:mm:ss");

  const params = {
    type: "changeTrackPlayback",
    changeStatus: true,
    examNo: playKsxh.value,
    startTime: formatStartTime,
    endTime: formatEndTime,
    playState: true,
    isDrag: true // 是否拖动
  };
  // 传入3d回放视频参数
  webMessagePort.postMessage(stringify(params));
  console.log(`%cweb回放传入3d开始参数：${stringify(params)}`, "color: blue;");
};

/**-------------------------监听模型加载------------------------ */
// 初始化一个随机的加载进度值，用于模拟加载进度变化的效果。
const isWebglMout = ref(false);
const progress = ref(Math.floor(Math.random() * 50));
const loadScene = function (progress1) {
  if (progress1 === 100) {
    setTimeout(() => {
      progress.value = 100;
      setTimeout(() => {
        progress.value = 200;
        isWebglMout.value = true;
        if (playVideoRef.value?.webGlPlayed) {
          playVideoRef.value.webGlPlayed();
        }
      }, 1000);
    }, 50);
  }
  console.log(`%c模型加载进度：${progress1}`, "color: blue;");
};
window.loadSceneQueue = [loadScene];
window.loadScene = function (p) {
  const progress1 = parseInt(p);
  for (let i = 0; i < loadSceneQueue.length; i++) {
    loadSceneQueue[i](progress1);
  }
};

onMounted(() => {});
</script>
<template>
  <div class="w-screen h-screen position-relative bg-#87ceeb" id="root">
    <!-- 3d模型加载loading -->
    <div
      v-if="progress <= 100"
      class="loading w-screen h-screen position-fixed"
    >
      <div>
        <el-progress
          :text-inside="true"
          :percentage="progress"
          :stroke-width="25"
          striped-flow
          striped
        >
          <template #default="{ percentage }">
            <span>模型加载{{ percentage }}%</span>
          </template>
        </el-progress>
      </div>
    </div>
    <!-- 预警 -->
    <warn></warn>
    <!-- 四周阴影 -->
    <shadow></shadow>
    <!-- 顶部 -->
    <nav-header />
    <!-- 侧边栏 -->
    <side-bar>
      <side-content :target-count="count">
        <side-warn />
      </side-content>
    </side-bar>
    <!-- 全屏弹框 -->
    <screen-view>
      <modal-box />
    </screen-view>
    <!-- 3d 页面 -->
    <webgl-iframe @load="handleWebglLoaded" />
    <!-- 底部按钮 -->
    <footer-btn v-model="count" />
    <play-video
      :key="playKey"
      v-if="playUrl"
      ref="playVideoRef"
      :isWebglMout="isWebglMout"
      @trackplay="handleVideoPlay"
      @trackpause="handleVideoPause"
      @trackchange="handleVideoChange"
    />
  </div>
</template>
<style scoped lang="less">
#root {
  overflow: hidden;
  // box-shadow: inset 81px 0px 250px 0px #04203a, inset 55px 0px 250px 0px #04203a;
}
.loading {
  z-index: 1001;
  background: #000000c4;
  display: flex;
  justify-content: center;
  align-items: center;
  > div {
    width: 50%;
  }
  :deep(.el-progress__text) {
    color: white;
  }
}
</style>
