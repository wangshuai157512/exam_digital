import { defineStore } from "pinia";
import { store } from "@/store";

export const sideBackStore = defineStore("back", {
  state: () => ({
    showSideBack: false
  }),
  getters: {
    getSideBack: (state) => state.showSideBack
  },
  actions: {
    setSideBack(status) {
      this.showSideBack = status;
    }
  }
});

export const sideBackStoreWithOut = () => {
  return sideBackStore(store);
};
