import { onBeforeUnmount, onMounted } from "vue";

export const useAutoScroll = function (ref, time, isScroll = { value: false }) {
  if (!ref) return;
  const timer = setInterval(() => {
    const { offsetHeight, scrollHeight, scrollTop } = ref;
    const top = scrollTop + offsetHeight;

    if (isScroll.value) return;
    ref.scrollTo({
      top: scrollTop >= scrollHeight - offsetHeight ? 0 : top,
      behavior: "smooth",
      duration: 2000
    });
  }, time);

  // 清楚定时器
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
};
