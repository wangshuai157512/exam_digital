<script setup>
import { onMounted, ref, unref } from "vue";
import { ElMessage } from "element-plus";
import { animated } from "@/utils/gsap";
import { modalStore } from "@/store/modules/modal";
import { examStore } from "@/store/modules/exam";
import { warnStore } from "@/store/modules/warn";
import { findWaringRealTime } from "@/api/index";
import usePolling from "@/hooks/usePolling";
import nodata from "@/assets/image/nodata.png";
import { useMessageChannel } from "@/hooks/useChannel";

const modal = modalStore();
const { addModalSet, setModalParam } = modal;

const exam = examStore();

const warn = warnStore();

const kcxh = unref(computed(() => exam.getExamId));

const warnData = ref([]);

// 获取等级
const warnGrade = function (l) {
  if (l === 1) {
    return "一级";
  }
  if (l === 2) {
    return "二级";
  }
  if (l === 3) {
    return "三级";
  }
};

let animatQue = [];

const warnAnimat = function () {
  // 杀掉动画
  animatQue.forEach((gsap) => {
    gsap.kill();
  });
  // 初始化状态
  document.getElementById("warn_top").style.boxShadow =
    "0px 10px 20px 0 rgb(247 8 8 / 0%)";
  document.getElementById("warn_right").style.boxShadow =
    "-10px 0 20px 0 rgb(247 8 8 / 0%)";
  document.getElementById("warn_bottom").style.boxShadow =
    "0px -10px 20px 0 rgb(247 8 8 / 0%)";
  document.getElementById("warn_left").style.boxShadow =
    "10px 0 20px 0 rgb(247 8 8 / 0%)";
  const top = animated("#warn_top", [
    { duration: 0.4, boxShadow: "0px 10px 20px 0 rgb(247 8 8)" },
    { duration: 0.4, boxShadow: "0px 10px 20px 0 rgb(247 8 8 / 0%)" }
  ]);
  const right = animated("#warn_right", [
    { duration: 0.4, boxShadow: "-10px 0 20px 0 rgb(247 8 8)" },
    { duration: 0.4, boxShadow: "-10px 0 20px 0 rgb(247 8 8 / 0%)" }
  ]);
  const left = animated("#warn_left", [
    { duration: 0.4, boxShadow: "10px 0 20px 0 rgb(247 8 8)" },
    { duration: 0.4, boxShadow: "10px 0 20px 0 rgb(247 8 8 / 0%)" }
  ]);
  const bottom = animated("#warn_bottom", [
    { duration: 0.4, boxShadow: "0px -10px 20px 0 rgb(247 8 8)" },
    { duration: 0.4, boxShadow: "0px -10px 20px 0 rgb(247 8 8 / 0%)" }
  ]);
  animatQue = [top, right, left, bottom];
};

const { webMessagePort, stringify } = useMessageChannel();

onMounted(() => {
  window.findWaringRealTime = function () {
    return findWaringRealTime({ kcxh });
  };
});

// 存放预警id 对比是否产生新的预警
let warnSet = new Set();
const getwarnData = function (f) {
  findWaringRealTime({ kcxh, size: 5 }).then((res) => {
    if (!res) return;
    const ids = res.records.map((item) => item.id);
    const hasSet = ids.every((id) => warnSet.has(id));
    const newwarn = res.records.find((item) => !warnSet.has(item.id));

    // 通知3d
    if (res.records.length) {
      webMessagePort.postMessage(
        stringify({
          type: "warn",
          data: res.records
        })
      );
    }

    warn.$patch({
      warnTotal: Number(res.total)
    });

    warnData.value = res.records.map((item) => {
      return {
        ...item,
        yjsj: item.yjsj.split(" ")[1],
        grade: warnGrade(item.yjsjdj)
      };
    });
    // 产生新的预警 并且为一级的时候提示警告
    if (warnSet.size > 0 && !hasSet) {
      warnSet = new Set(ids);
      if (newwarn.yjsjdj === 1) {
        warnAnimat();
      }
      warn.$patch({
        warnInfo: newwarn
      });
    }
    if (warnSet.size === 0) {
      warnSet = new Set(ids);
    }
    f();
  });
};

// 加载数据
usePolling(getwarnData);

// 获取级别状态颜色
const levelStyle = function (level) {
  let style;
  switch (level) {
    case 1:
      style = { color: "#FF0000" };
      break;
    case 2:
      style = { color: "#F09609" };
      break;
    default:
      style = { color: "#DEDE00" };
      break;
  }
  return style;
};

// 点击处理详情
const handleDetails = function (rows) {
  addModalSet(0);
  setModalParam(rows);
};
</script>
<template>
  <div id="warn">
    <!-- 左下方预警信息 -->
    <div class="color-white box-border pl-10px pr-10px">
      <div class="h-30px flex items-center justify-between">
        <p class="font-size-16px">最新预警信息</p>
        <p @click="addModalSet(1)" class="font-size-12px cursor-pointer">
          查看更多>>
        </p>
      </div>
      <div class="container-warn">
        <ul v-if="warnData.length">
          <li
            @click="handleDetails(item)"
            v-for="(item, index) in warnData"
            :key="index"
            class="warn-list font-size-12px flex justify-between"
          >
            <p>{{ item.yjsj }}</p>
            <p class="w-200px fd">{{ item.yjjx }}：{{ item.yjxx }}</p>
            <p :style="levelStyle(item.yjsjdj)">{{ item.grade }}</p>
          </li>
        </ul>
        <div
          class="w-100% h-100% flex flex-wrap items-center justify-center flex-col"
          v-else
        >
          <img :src="nodata" alt="" />
          <p class="w-100% text-center">暂无相关数据</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
#warn,
#warn > div {
  height: 100%;
}
.container-warn {
  // height: calc(100% - 30px);
  overflow-y: scroll;
  .warn-list {
    cursor: pointer;
    padding: 6px 2px;
    margin-bottom: 2px;
    &:nth-child(even) {
      background-color: #cccccc69; /* 设置偶数行的背景色 */
    }
    &:hover {
      background: #02f0f496;
    }
    .fd {
      white-space: nowrap; /* 防止文字换行 */
      overflow: hidden; /* 隐藏溢出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
    }
  }
}
</style>
