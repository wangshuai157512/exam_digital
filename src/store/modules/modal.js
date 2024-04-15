import { defineStore } from "pinia";
import { store } from "@/store";

export const modalStore = defineStore("modal", {
  state: () => ({
    modalSet: new Set(),
    modalParam: null
  }),

  getters: {
    getModalSet: (state) => state.modalSet,
    getModalParam: (state) => state.modalParam
  },

  actions: {
    addModalSet(status) {
      this.modalSet.add(status);
    },
    removeModalSet(status) {
      if (!this.modalSet.has(status)) {
        console.error(`modalSet is not exist ${status}`);
        return;
      }
      this.modalSet.delete(status);
    },
    setModalParam(status) {
      this.modalParam = status;
    }
  }
});

export const modalStoreWithOut = () => {
  return modalStore(store);
};
