<script setup>
import { onMounted, reactive, ref, unref } from "vue";
import usePolling from "@/hooks/usePolling";
import { init } from "echarts";
import { getExamIneeOpt, getTodayWarn } from "./echartsopt";
import {
  getWranNum,
  getExamIneeNum,
  equipmentList,
  examCarList
} from "@/api/index";
import { examStore } from "@/store/modules/exam";
import { useSocketCar } from "./hooks/useSocketCar";
import sb from "~/image/sb.png";
import cl from "~/image/cl.png";

const exam = examStore();

const examId = unref(computed(() => exam.getExamId));

const { carMap, getCar } = useSocketCar();

// 考生人数统计
const examinee = ref();

const props = defineProps({ targetCount: Number });

let examIneeRef;

onMounted(() => {
  examIneeRef = init(unref(examinee));
});

const handleExamInee = function (run) {
  getExamIneeNum(examId).then((res) => {
    if (!res || props.targetCount !== 0) return;
    const successNum = res.successNum || 0;
    const failNum = res.failNum || 0;
    const proceedNum = res.proceedNum || 0;
    const awaitNum = res.awaitNum || 0;
    const unregisteredNum = res.unregisteredNum || 0;

    document.querySelector("#title").innerText = `当前合格率：${
      res.passRate || 0
    }%`;

    const examIneeData = [
      { value: successNum, name: `合格: ${successNum}人` },
      { value: failNum, name: `不合格: ${failNum}人` },
      { value: proceedNum, name: `正在考试: ${proceedNum}人` },
      { value: awaitNum, name: `等待考试: ${awaitNum}人` },
      { value: unregisteredNum, name: `未报到: ${unregisteredNum}人` }
    ];
    examIneeRef.setOption(getExamIneeOpt(examIneeData));
    run();
  });
};

usePolling(handleExamInee, 10000);
// 今日预警统计
const todaywarn = ref();
const wranData = reactive({
  yjyj: 0,
  ejyj: 0,
  sjyj: 0,
  yjycl: 0,
  ejycl: 0,
  sjycl: 0,
  yjRate: 0,
  ejRate: 0,
  sjRate: 0
});
let todayWarnRef;

const handleTodayWarn = function (run) {
  const todayWarnData = [
    { value: 0, name: "一级" },
    { value: 0, name: "二级" },
    { value: 0, name: "三级" }
  ];
  getWranNum(examId).then((res) => {
    if (res) {
      const { yjyj, ejyj, sjyj, yjcls, ejcls, sjcls } = res;
      todayWarnData[0].value = wranData.yjyj = yjyj || 0;
      todayWarnData[1].value = wranData.ejyj = ejyj || 0;
      todayWarnData[2].value = wranData.sjyj = sjyj || 0;
      wranData.yjycl = yjcls || 0;
      wranData.ejycl = ejcls || 0;
      wranData.sjycl = sjcls || 0;
      wranData.yjRate = Math.floor((yjcls / yjyj) * 100) || 0;
      wranData.ejRate = Math.floor((ejcls / ejyj) * 100) || 0;
      wranData.sjRate = Math.floor((sjcls / sjyj) * 100) || 0;
    }
    // 图表渲染
    todayWarnRef.setOption(getTodayWarn(todayWarnData));
    run();
  });
};

usePolling(handleTodayWarn, 10000);

onMounted(() => {
  todayWarnRef = init(unref(todaywarn));
});

// 监控设备
const monitor = reactive({
  total: 0, // 总数
  normal: 0, // 正常
  fault: 0 // 故障
});
onMounted(() => {
  equipmentList({ kcxh: examId }).then((res) => {
    if (res) {
      res.forEach((item) => {
        if (item.zt === "1") {
          monitor.normal++;
        } else {
          monitor.fault++;
        }
      });
      monitor.total = res.length;
    }
  });
});

// 考试车辆
onMounted(() => {
  examCarList({ examId }).then((res) => {
    if (res) {
      res.forEach((carItem) => {
        const carId = `${carItem.syzjcx}-${Number(carItem.kcbh)}`;
        if (!getCar(carId)) {
          const status = carItem.clzt === "B" ? 5 : 4;
          carMap[carId] = { status };
        }
      });
    }
  });
});

// 统计车辆数量
const statistics = function (map) {
  const status = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  Object.keys(map).forEach((key) => {
    const item = map[key];

    status["0"]++; // 全部
    if (item.status === 5) {
      status["1"]++; // 停用
    }
    if (item.status === 0) {
      status["2"]++; // 空闲
    }
    if (item.status === 1) {
      status["3"]++; // 已分配
    }
    if (item.status === 2) {
      status["4"]++; // 考试中
    }
    if (item.status === 3) {
      status["5"]++; // 已结束
    }
  });

  return status;
};
</script>
<template>
  <div class="main-container">
    <!-- <div class="nav">
      当前合格率:{{ passRate }}%
      <el-progress
        class="m-l-12px"
        :stroke-width="2"
        :show-text="false"
        :width="25"
        :percentage="passRate"
        type="circle"
      />
    </div> -->
    <div class="title">考生人数统计</div>
    <div ref="examinee" class="echarts-container h-130px"></div>
    <div class="title">考试车辆</div>
    <div class="min-container">
      <div class="min-content">
        <img :src="cl" alt="" />
        <ul>
          <li class="car-1">全部：{{ statistics(carMap)[0] }}</li>
          <li class="car-2">空闲：{{ statistics(carMap)[2] }}</li>
          <li class="car-3">停用：{{ statistics(carMap)[1] }}</li>
        </ul>
        <ul>
          <li class="car-4">已分配：{{ statistics(carMap)[3] }}</li>
          <li class="car-5">考试中：{{ statistics(carMap)[4] }}</li>
          <li class="car-6">已结束：{{ statistics(carMap)[5] }}</li>
        </ul>
      </div>
    </div>

    <div class="title">监控设备</div>
    <div class="min-container">
      <div class="min-content">
        <img :src="sb" alt="" />
        <div class="device-num">
          <div style="flex: 1.1">
            <p>设备总数</p>
            <p class="font-size-14px">{{ monitor.total }}</p>
          </div>
          <div style="margin: 0 10px">
            <p>正常</p>
            <p class="color-#00EE43 font-size-14px">{{ monitor.normal }}</p>
          </div>
          <div>
            <p>故障</p>
            <p class="color-#ff0000 font-size-14px">{{ monitor.fault }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="title">今日预警统计</div>
    <div class="echarts-container h-128px">
      <div class="w-40%" ref="todaywarn"></div>
      <div class="w-60%">
        <el-progress
          :stroke-width="10"
          :percentage="wranData.yjRate"
          color="#c00000"
        >
          <p class="font-size-12px text-right color-white" text>
            {{ wranData.yjycl }}/{{ wranData.yjyj }}
          </p>
        </el-progress>
        <el-progress
          :stroke-width="10"
          :percentage="wranData.ejRate"
          color="#ff6c00"
        >
          <p class="font-size-12px text-right color-white" text>
            {{ wranData.ejycl }}/{{ wranData.ejyj }}
          </p>
        </el-progress>
        <el-progress
          :stroke-width="10"
          :percentage="wranData.sjRate"
          color="#ffbf37"
        >
          <p class="font-size-12px text-right color-white" text>
            {{ wranData.sjycl }}/{{ wranData.sjyj }}
          </p>
        </el-progress>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.main-container {
  color: white;
  box-sizing: border-box;
  padding: 0 10px;
  .nav {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    :deep(.el-progress__text) {
      font-size: 1rem !important;
      color: white;
    }
  }
  > .title {
    font-size: 20px;
    padding: 4px 0 4px 50px;
    background-image: url("~/image/inee.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .echarts-container {
    display: flex;
    > .today-warn {
      width: 40% !important;
    }
    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      :deep(.el-progress-bar__inner) {
        display: flex;
        align-items: center;
      }
      :deep(.el-progress-bar__innerText) {
        width: 100%;
      }
      :deep(.el-progress) {
        margin-bottom: 16px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .min-container {
    height: 100px;
    box-sizing: border-box;
    padding: 8px 12px 8px 8px;
    .title {
      font-size: 16px;
      height: 30px;
      line-height: 30px;
    }
    .min-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      img {
        width: 50px;
        height: 50px;
      }
      ul {
        width: 35%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        li {
          font-size: 14px;
          padding-left: 22px;
          position: relative;
          &::after {
            content: "";
            width: 10px;
            height: 10px;
            border-radius: 50%;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            cursor: pointer;
          }
        }
        .car-1::after {
          background: white;
        }
        .car-2::after {
          background: #00e5cd;
        }
        .car-3::after {
          background: red;
        }
        .car-4::after {
          background: #ab4cd3;
        }
        .car-5::after {
          background: #00adef;
        }
        .car-6::after {
          background: #a8a8a8;
        }
      }
      .device-num {
        width: calc(100% - 80px);
        height: 50px;
        display: flex;
        > div {
          flex: 1;
          font-size: 14px;
          box-sizing: border-box;
          padding: 4px 0;
          background-image: url("~/image/sb-bg.png");
          background-size: 100% 100%;
          background-repeat: no-repeat;

          p {
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
