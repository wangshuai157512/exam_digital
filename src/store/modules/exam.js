import { defineStore } from "pinia";
import { store } from "@/store";

export const examStore = defineStore("exam", {
  state: () => ({
    id: null, // 考场id
    kcdddm: null, // 考试地点
    km: null // 科目
  }),

  persist: {
    enabled: true // 开启持久化保存
  },

  getters: {
    getExamId: (state) => state.id,
    getExamKcdd: (state) => state.kcdddm,
    getExamKm: (state) => state.km
  }
});

export const examStoreWithOut = () => {
  return examStore(store);
};
