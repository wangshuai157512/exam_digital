<script setup>
import { onMounted, ref, unref, onBeforeMount } from "vue";
import { examarea, itemInfo } from "@/api/index";
import usePolling from "@/hooks/usePolling";
import { useMessageChannel } from "@/hooks/useChannel";
import cf from "@/assets/image/cefang_big.png";
import dk from "@/assets/image/daoku_big.png";
import zj from "@/assets/image/zhijiao_big.png";
import sw from "@/assets/image/swan_big.png";
import pq from "@/assets/image/poqi_big.png";
import qj from "@/assets/image/quanjing_big.png";
import { examStore } from "@/store/modules/exam";

const exam = examStore();

const examId = unref(computed(() => exam.getExamId));

const km = unref(computed(() => exam.getExamKm));

const data = ref([]);
const emit = defineEmits(["change"]);

// 给3d提供方法
onBeforeMount(() => {
  window.getExamArea = function () {
    return examarea(examId);
  };
});

// 页面卸载时清除
onUnmounted(() => {
  window.getExamArea = null;
});

const getImageSrc = function (n) {
  if (n.startsWith("侧方")) {
    return cf;
  } else if (n.startsWith("直角")) {
    return zj;
  } else if (n.startsWith("倒车")) {
    return dk;
  } else if (n.startsWith("坡道")) {
    return pq;
  } else if (n.startsWith("曲线")) {
    return sw;
  } else {
    return qj;
  }
};

const getType = function (t) {
  const n = t.name;
  if (n.startsWith("侧方")) {
    return "cefang";
  } else if (n.startsWith("直角")) {
    return "zhijiao";
  } else if (n.startsWith("倒车")) {
    return "daoku";
  } else if (n.startsWith("坡道")) {
    return "poqi";
  } else if (n.startsWith("曲线")) {
    return "quxian";
  } else if (t.id) {
    return t.id;
  }
};

const { webMessagePort, stringify } = useMessageChannel();

const handleChange = function ({ type, xmqym }) {
  webMessagePort.postMessage(
    stringify({
      type: "examProject",
      examType: type,
      number: xmqym
    })
  );
};

// 跳转线路
const handleLine = function (r) {
  webMessagePort.postMessage(
    stringify({
      type: "examArea",
      examType: r.id
    })
  );
};

usePolling(async (run) => {
  const area = await examarea(examId);
  const info = await itemInfo(examId);

  data.value = area.map((item) => {
    const type = getType(item);
    return {
      ...item,
      src: getImageSrc(item.name),
      list: item.list.map((j) => ({ ...j, type })),
      info: info.find(({ itemName }) => itemName === item.name)
    };
  });
  run();
});

const getSubt = function (name, t) {
  if (km == 2) {
    if (name === "侧方停车") {
      return "侧方";
    } else if (name === "倒车入库") {
      return "倒库";
    } else if (name === "直角转弯") {
      return "直角";
    } else if (name === "坡道定点停车和起步") {
      return "坡起";
    } else {
      return "曲线";
    }
  }
  return t;
};
</script>
<template>
  <div class="area-container">
    <ul v-if="data.length" class="p-l-15px p-r-20px box-border">
      <li class="m-b-16px mt-6px" v-for="(item, index) in data" :key="index">
        <!-- <h5 class="color-white">{{ item.name }}({{ item.list.length }})</h5> -->
        <div class="flex mb-8px flex-justify-between color-white">
          <img
            v-if="km == 3"
            @click="handleLine(item)"
            class="h-75px cursor-pointer"
            :src="item.src"
            alt=""
          />
          <img v-else class="h-75px" :src="item.src" alt="" />
          <div
            class="exam-area-list h-75px w-100% flex flex-wrap flex-col flex-justify-between p-l-12px box-border"
          >
            <p style="color: #e4fefe; font-size: 16px">{{ item.name }}</p>
            <!-- <p>占用:{{ item.occupancy }}</p> -->

            <p v-if="km == 2" class="flex flex-justify-between">
              <span>占用区域:{{ item.occupancy }}</span>
              <span>空闲区域:{{ item.idles }}</span>
            </p>
            <p v-else class="flex flex-justify-between">
              <span>在考车辆:{{ item.occupancy }}台</span>
              <span></span>
            </p>
            <p class="flex flex-justify-between">
              <span>平均用时:{{ item.info ? item.info.avgTimeStr : 0 }}</span>
              <span>合格率:{{ item.info ? item.info.passRate : 0 }}%</span>
            </p>
          </div>
          <div class="flex flex-wrap">
            <!-- <p class="text-center w-50px">合格率</p>
          <el-progress
            class="m-auto"
            striped-flow
            :width="38"
            :stroke-width="4"
            type="circle"
            :percentage="item.info ? item.info.passRate : 0"
          /> -->
          </div>
        </div>
        <div class="jd flex flex-wrap">
          <p
            @click="handleChange(t)"
            :class="[t.occupy === 1 ? 'pass' : '']"
            v-for="(t, i) in item.list"
            :key="i"
          >
            {{ getSubt(item.name, t.name) }}
            <span v-if="km == 2">{{ i + 1 }}</span>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
.area-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  // &::-webkit-scrollbar {
  //   // position: relative;
  //   display: block;
  //   width: 2px; /* 设置滚动条宽度 */
  //   border-right: 1px solid #d9ffffad; /* 设置滚动条右侧边框 */
  //   box-shadow: inset 0 0 10px #d9ffffad; /* 设置滚动条内部阴影 */
  // }

  // // &::-webkit-scrollbar-track {
  // //   // background-color: #f5f5f5; /* 设置背景色 */
  // // }

  // &::-webkit-scrollbar-thumb {
  //   position: absolute;
  //   width: 2px;
  //   background: #00fefe;
  //   border-radius: 1px; /* 设置滑块颜色 */
  // }

  // &::-webkit-scrollbar-thumb:hover {
  //   background: rgb(49, 255, 255); /* 当鼠标悬停在滑块上时的颜色 */
  // }
}
:deep(.el-progress__text) {
  min-width: 38px;
  font-size: 0.8rem !important;
  color: white;
}

.exam-area-list {
  p {
    font-size: 0.9rem;
  }
}

li {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0px;
    right: 0px;
    margin: auto;
    width: 100%;
    height: 1px; /* 控制下边框的高度 */
    background: linear-gradient(
      244deg,
      rgba(255, 255, 255, 0) 0,
      #00f6ff 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }
}

.jd {
  p {
    // width: 60px;
    // height: 32px;
    text-align: center;
    // line-height: 32px;
    background-image: url("~/image/area_t.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position-x: center;
    cursor: pointer;
    color: white;
    font-size: 14px;
    font-style: italic;
    padding: 4px 14px 4px 8px;
    // margin-right: 6px;
  }
  // p:nth-child(n + 8) {
  //   margin-top: 4px;
  // }
  .pass {
    background-image: url("~/image/area_s.png");
  }
}
</style>
