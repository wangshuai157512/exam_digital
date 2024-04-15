import { ref, unref, onUnmounted, onMounted, watch } from "vue";
import {
  addResizeListener,
  removeResizeListener
} from "@/utils/resize-event.js";

export const useNodeScrollStyle = function (nodeRef) {
  const node = ref(null);

  const scroll = function () {
    if (unref(nodeRef)) {
      const exam = document.querySelector(".exam").getBoundingClientRect();
      const nodeRect = unref(nodeRef).getBoundingClientRect();
      node.value = {
        height: `${exam.height - (nodeRect.top - exam.top) - 10}px`,
        "overflow-y": "scroll"
      };
    }
  };

  watch(
    () => nodeRef.value,
    () => {
      if (!unref(node)) {
        addResizeListener(unref(nodeRef), scroll);
      }
    }
  );

  return node;
};
