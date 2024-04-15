<script setup>
import RtcVideo from "@/components/RtcVideo/index.vue";
import { computed, onMounted, unref, useAttrs } from "vue";
import shousuo from "~/image/shousuo.png";
import zhankai from "~/image/zhankai.png";

const attrs = useAttrs();

const isOpen = ref(true);

const transformStyle = computed(() => {
  return {
    transform: `translateX(${unref(isOpen) ? 0 : "100%"})`
  };
});
</script>
<template>
  <div :style="transformStyle" class="container-video">
    <div>
      <img
        :class="['icon', !isOpen ? 'active' : '']"
        @click="isOpen = !isOpen"
        :src="shousuo"
      />
      <rtc-video v-bind="$attrs" class="video"></rtc-video>
    </div>
  </div>
</template>
<style scoped lang="less">
.container-video {
  padding: 50px 6px 12px 14px;
  position: fixed;
  top: 6%;
  right: 0;
  transition: all 0.12s;
  background-image: url("~/image/spbk.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  div {
    position: relative;
    .video {
      width: 350px;
      aspect-ratio: 4/3;
      background: black;
    }
    .icon {
      width: 25px;
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
      left: -25px;
      cursor: pointer;
      // transform: rotate(180deg);
      // transition: all 0.12s;
    }
    .active {
      left: -40px;
      transform: rotate(180deg);
    }
  }
}
</style>
