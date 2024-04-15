import { onMounted, onBeforeUnmount } from "vue";

export default function usePolling(apiFunction, interval = 5000) {
  let timer;

  const timeRun = function (...args) {
    timer = setTimeout(apiFunction, interval, timeRun, args);
  };

  onMounted(() => {
    apiFunction(timeRun);
  });

  onBeforeUnmount(() => {
    clearTimeout(timer);
  });
}
