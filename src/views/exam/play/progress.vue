<script setup>
import { ref, onMounted, computed } from "vue";
import { formatDiffDuration } from "@/utils/day.js";
import play from "~/image/video-play.png";
import pause from "~/image/video-pause.png";

/** isPlay 是否正在播放 currentTime 当前时间 timeLong 总时长*/
const props = defineProps({
  isPlay: Boolean,
  currentTime: Number,
  timeLong: Number
});

const format = "HH:mm:ss";

const emits = defineEmits(["timeUpdate", "play", "pause", "changUp"]);

const isPlay = computed(() => props.isPlay);

// 获取当前时间
const currentTime = computed(() => {
  return formatDiffDuration(0, props.currentTime, format);
});

// 根据当前时间转换步长(步长为1秒)
const step = computed(() => {
  return Math.floor(props.currentTime / 1000);
});

// 根据毫秒时间转换实际时长
const timeLong = computed(() => {
  return formatDiffDuration(0, props.timeLong, format);
});

// 计算总步长
const stepTotal = Math.floor(props.timeLong / 1000);

// 拖拽更新时长
const handleInput = function (target) {
  emits("timeUpdate", target);
};

// 松开鼠标后触发
const handleChange = function (target) {
  emits("changUp", target);
};

// 触发播放或者暂停事件
const handleClick = function () {
  emits(isPlay.value ? "pause" : "play");
};
</script>
<template>
  <div class="slider-container">
    <div class="w-50px mr-20px">
      <img @click="handleClick" class="icon" :src="isPlay ? pause : play" />
    </div>
    <el-slider
      @change="handleChange"
      @input="handleInput"
      :model-value="step"
      :show-tooltip="false"
      :max="stepTotal"
    ></el-slider>
    <div class="timer">{{ currentTime }}/{{ timeLong }}</div>
  </div>
</template>
<style scoped lang="less">
.slider-container {
  height: 40px;
  width: calc(100% - 540px);
  position: fixed;
  bottom: 70px;
  right: 50px;
  margin: auto;
  display: flex;
  align-items: center;
  .icon {
    cursor: pointer;
  }
  .timer {
    color: white;
    font-size: 20px;
    margin-left: 20px;
  }
  :deep(.el-slider__runway) {
    background-color: rgba(220, 220, 220, 0.555);
  }
  :deep(.el-slider__button) {
    border: none;
    cursor: pointer;
  }
  :deep(.el-slider__button-wrapper) {
    cursor: pointer;
  }
  :deep(.el-slider__bar) {
    background-color: white;
  }
}
</style>
