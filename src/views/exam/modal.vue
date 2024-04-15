<script lang="jsx">
import { unref } from "vue";
import { modalStore } from "@/store/modules/modal";
import { defineComponent } from "vue";
import WarnDetails from "./warn/details.vue";
import WarnRight from "./warn/rightwarn.vue";
import Result from "./result/index.vue";
import ResultDetails from "./result/details.vue";
import Statistics from "./statistics/index.vue";

const modal = modalStore();
const modalSet = computed(() => modal.getModalSet);

// modal.addModalSet(1);

export default defineComponent({
  components: {
    Result,
    ResultDetails,
    WarnDetails,
    WarnRight,
    Statistics
  },

  setup(props, { slots }) {
    const redirect = function (set) {
      const s = [];
      const p = [
        <WarnDetails />,
        <WarnRight />,
        <Statistics />,
        <Result />,
        <ResultDetails />
      ];

      set.forEach((v, i) => {
        s.push(p[v]);
      });

      return s;
    };

    const renderNode = function (components) {
      return unref(modalSet).size ? (
        <div class="h-screen">{components(unref(modalSet))}</div>
      ) : (
        <div></div>
      );
    };

    return () => renderNode(redirect);
  }
});
</script>
