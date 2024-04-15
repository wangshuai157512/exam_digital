import { defineStore } from "pinia";
import { store } from "@/store";

export const warnStore = defineStore("warn", {
  state: () => ({
    warnTotal: 0,
    warnInfo: {}
  }),
  getters: {
    getwarnTotal: (state) => state.warnTotal,
    getwarnInfo: (state) => state.warnInfo
  }
});

export const warnStoreWithOut = () => {
  return warnStore(store);
};
