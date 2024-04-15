import { defineStore } from "pinia";
import { store } from "@/store";

export const playStore = defineStore("play", {
  state: () => ({
    url: null,
    isBackPlay: false,
    key: 0, // 用于强制刷新播放器
    ksxh: null, // 考试序号
    startTime: null,
    endTime: null
  }),

  getters: {
    getPlayUrl: (state) => state.url,
    getBackPlayStatus: (state) => state.isBackPlay,
    getPlayKey: (state) => state.key,
    getPlayKsxh: (state) => state.ksxh,
    getPlayStartTime: (state) => state.startTime,
    getPlayEndTime: (state) => state.endTime
  }
});

export const playStoreWithOut = () => {
  return playStore(store);
};
