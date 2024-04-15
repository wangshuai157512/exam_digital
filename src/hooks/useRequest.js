import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import { ElLoading } from "element-plus";
import { useRouter } from "vue-router";
import api from "@/api";

export const useRequest = async (name, data) => {
  const { push } = useRouter();
  const pramas = reactive(data);
  const result = ref(null);

  onMounted(() => {
    methods.getResult();
  });

  watch(
    () => pramas,
    (newValue, oldValue) => {
      methods.getResult();
    },
    { deep: true }
  );

  const methods = {
    async getResult() {
      try {
        const loadingInstance = ElLoading.service({ fullscreen: true });
        const res = await api[name](pramas);
        loadingInstance.close();
        if (res.code === 200) {
          result.value = res.data;
        }

        if (res.code === 500) {
          push("/login");
        }
      } catch (error) {}
    }
  };
  console.log(pramas);
  return {
    pramas
  };
};
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0);
  const y = ref(0);

  // 组合式函数可以随时更改其状态。
  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  // 一个组合式函数也可以挂靠在所属组件的生命周期上
  // 来启动和卸载副作用
  onMounted(() => window.addEventListener("mousemove", update));
  onUnmounted(() => window.removeEventListener("mousemove", update));

  // 通过返回值暴露所管理的状态
  return { x, y };
}
