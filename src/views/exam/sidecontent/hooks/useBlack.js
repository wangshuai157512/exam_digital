import { sideBackStore } from "@/store/modules/side";
import { computed } from "vue";

export const useBlackStatus = function () {
  const backStore = sideBackStore();

  const { setSideBack } = backStore;

  const trigger = function () {
    setSideBack(true);
  };

  const back = function () {
    setSideBack(false);
  };

  const getSideBack = computed(() => backStore.getSideBack);

  const transFormStyle = computed(() => {
    return { transform: `translateX(-${!backStore.getSideBack ? 0 : "50%"})` };
  });

  return { trigger, back, transFormStyle, getSideBack };
};
