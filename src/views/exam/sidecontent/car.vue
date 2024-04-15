<script setup>
import car from "@/assets/image/bs.png";
import qs from "qs";
import { ElMessage } from "element-plus";
import { Search, Avatar } from "@element-plus/icons-vue";
import { useBlackStatus } from "./hooks/useBlack";
import { useNodeScrollStyle } from "./hooks/useNode";
import { useSocketCar } from "./hooks/useSocketCar";
import { formatDiffDuration, formattedDate, toUnix } from "@/utils/day";
import PageTransition from "./components/PageTransition.vue";
import JudgeRadio from "./components/JudgeRadio.vue";
import { cloneDeep } from "lodash-es";
import { modalStore } from "@/store/modules/modal";
import {
  ref,
  reactive,
  onMounted,
  watch,
  onUnmounted,
  onBeforeUnmount,
  nextTick
} from "vue";
import {
  getCarType,
  examCarList,
  examCarPassrate,
  examCarInfo,
  examCarPass,
  getCodePoint,
  getExamCarPointInfo,
  examCarUpdateStatus
} from "@/api/index";
import { getWebRtcRtspUrl } from "@/config/webrtc/index";
import { examStore } from "@/store/modules/exam";
import { useMessageChannel } from "@/hooks/useChannel";
import usePolling from "@/hooks/usePolling";
import { playStore } from "@/store/modules/play";
import { sortBy } from "lodash-es";
// import carUser from "@/assets/image/car-user.jpg";
const modal = modalStore();

const play = playStore();

const exam = examStore();

const examId = unref(computed(() => exam.getExamId));
const km = unref(computed(() => exam.getExamKm));
const playUrl = computed(() => play.getPlayUrl);

const { webMessagePort, stringify } = useMessageChannel();

const count = ref(0);
const carList = ref([]);
const height = ref(300);

const { trigger, getSideBack, back } = useBlackStatus();

const menuTitle = ["全部", "停用", "空闲", "已分配", "考试中", "已结束"];

const { carMap, getCar } = useSocketCar();

// 请求参数
const from = reactive({
  carId: "",
  carType: "",
  examId
});

// 考试车型
const carTypeList = ref([]);
onMounted(() => {
  getCarType(examId).then((res) => {
    if (res) {
      carTypeList.value = res.kkcx.split(",");
    }
  });
});

// 给3d挂载根据code查询项目
onMounted(() => {
  window.getCodePoint = getCodePoint;
});

// 页面卸载时清除
onUnmounted(() => {
  window.getCodePoint = null;
});

let carPassrateLst = [],
  warnCarPass = [];

// 根据考试状态进行列表排序
const sortBase = {
  // 0 未进行考试  1 分配完成  2 考试中  3 考试结束  4 车辆未连接  5 车辆停用
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 2,
  5: 2
};

// 根据sort字段排序(数字小的优先级高)
const sortCarList = (list) => {
  return sortBy(list, "sort");
};

// 数据转换
const carConvert = function (carItem) {
  const carPassrate = carPassrateLst.find((item) => item.kcbh === carItem.kcbh);
  const warn = warnCarPass.find((item) => item.carCode === carItem.hphm);
  const carId = `${carItem.syzjcx}-${Number(carItem.kcbh)}`;

  if (!getCar(carId)) {
    const status = carItem.clzt === "B" ? 5 : 4;

    carMap[carId] = {
      status,
      examinee: "--",
      id: null,
      examnum: null
    };
  }

  return {
    ...carItem,
    carId,
    sort: sortBase[getCar(carId).status],
    warn: warn ? warn.success : null,
    carPassrate: carPassrate ? Number(carPassrate.hgl) : 0
  };
};

// 检索条件
const ide = function (item) {
  const { carId, clzt } = item;
  const car = getCar(carId);

  if (count.value === 0) {
    return true;
  } else if (count.value === 1 && car.status === 5) {
    return true;
  } else if (count.value === 2 && car.status === 0) {
    return true;
  } else if (count.value === 3 && car.status === 1) {
    return true;
  } else if (count.value === 4 && car.status === 2) {
    return true;
  } else if (count.value === 5 && car.status === 3) {
    return true;
  } else {
    return false;
  }
};

let data = [];

// 列表检索条件
const search = function () {
  const { carId, carType } = from;

  carList.value = sortCarList(
    data
      .map(carConvert)
      .filter(
        (item) =>
          ide(item) &&
          ((carType && carType == item.syzjcx && item.kcbh.includes(carId)) ||
            (!carType && item.kcbh.includes(carId)))
      )
  );
};

// 获取考车列表
const getExamCarList = async (run) => {
  let count = 0;

  const hoop = function () {
    search();
    if (++count === 3) {
      run();
    }
  };
  // 跳转详情后不需要轮询请求
  if (!getSideBack.value) {
    examCarPassrate(examId).then((res) => {
      carPassrateLst = res || [];
      hoop();
    });
    examCarPass(examId).then((res) => {
      warnCarPass = res || [];
      hoop();
    });
    examCarList({ examId }).then((res) => {
      data = res || [];
      hoop();
    });
  }
};

const containerCarList = ref();
const containerCarStyle = useNodeScrollStyle(containerCarList);

// 是否发生变化
let hphm1, carInfol;

const carInfoChange = function (obj, fn) {
  // 监听发生变化的字段
  const keys = ["status", "details"];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];

    if (key === "status") {
      if (value !== carInfol.status) {
        console.log(`%c考生状态发生改变：${key} ${value}`, "color: red;");
        fn(key, value);
        return;
      }
    }
    // 考生项目详情变化
    if (key === "details") {
      if (qs.stringify(value) != qs.stringify(carInfol.details)) {
        console.log(`%c考生项目详情发生改变：${key}`, "color: red;");
        console.log(value);
        fn(key, value);
      }
      //考生状态变化
    }
  }
};

let currentProject, // 当前项目
  passProject = [], // 通过项目
  dedProject = [], // 扣分项目
  runningDetails = [], // 流水明细
  projectList = []; // 考试项目

// 处理车辆详情
const handleCarDetails = function (details) {
  let detailsArr = [];
  // 流水明细 不存在空串
  if (details.runningDetails !== "") {
    detailsArr = details.runningDetails.split(",");
  }

  currentProject = details.currentProject;
  passProject = details.passProject.split(",");
  dedProject = details.dedProject.split(",");

  // 流水是否发生变化
  if (detailsArr.length !== runningDetails.length) {
    runningDetails = detailsArr;
    handleRunningDetails();
  }
};

// 处理流水详情
const handleRunningDetails = function () {
  const projectName = projectList.map((p) => p.itemName);
  const projectCode = projectList.map((p) => p.itemCode);

  if (projectList.length === 0) {
    return (carPointDTOList.value = []);
  }

  // 项目状态
  const projectStatus = {};

  // 名称展示
  carPointDTOList.value = runningDetails.map((dateils) => {
    const dateilsArr = dateils.split("~");
    const dateilsDate = dateilsArr[1];
    const dateilsCode = dateilsArr[0];
    const index = projectCode.indexOf(dateilsCode);

    // 根据code查找项目名称
    if (index > -1) {
      // 根据出现次数判断开始还是结束
      projectStatus[dateilsCode] = (projectStatus[dateilsCode] || 0) + 1;
      // 项目开始
      if (projectStatus[dateilsCode] % 2 === 1) {
        return `${dateilsDate} ${projectName[index]}项目开始`;
      } else {
        // 项目结束
        return `${dateilsDate} ${projectName[index]}项目结束`;
      }
    }

    // 扣分项直接返回名称
    return `${dateilsDate} ${dateilsCode}`;
  });
};

// 更新考生信息
const updateExamInfo = function (carMap) {
  if (dCarId) {
    const currentCarInfo = carMap[dCarId];
    if (currentCarInfo) {
      // 是否当前车辆信息发生变化
      carInfoChange(currentCarInfo, function (key, value) {
        // let time = 2000;
        if (key === "status" && value === 0) {
          // 车辆空闲中重置状态
          reset();

          return;
          // 状态异常返回列表
        } else if (key === "status" && value > 3) {
          back(); // 返回列表

          return;
        }

        // 详情变化包含当前项 扣分项 通过项 扣分明细
        // 分数变化时是发生扣分
        if (key === "details") {
          handleCarDetails(value);
        }

        carInfol = cloneDeep(currentCarInfo);

        // 已分配和考试中状态立马展示考生信息
        if (key === "status" && [1, 2, 3].includes(value)) {
          if (currentCarInfo.id) {
            carInfo();
          }
        }

        // 延迟调用后台查询 以防数据还未同步
        // upDateCarTimer = setTimeout(() => {
        //   // 存在考生信息时查询接口
        //   if (currentCarInfo.id) {
        //     carInfo();
        //   }
        // }, time);
      });
    }
  }
};

// 监听检索框 tap 实时协议
watch(from, search);
watch(count, search);
watch(carMap, search);
watch(carMap, updateExamInfo);

// 时间截取方法
const timeSplit = function (time) {
  if (!time) {
    return "--";
  }
  return time.split(" ")[1];
};

// 详情
const detailsInfo = ref(null);
const carPointDTOList = ref([]);
const project = ref([]);
const photo = ref(null);
let dCarId, dCarIds, upDateCarTimer;

const reset = function () {
  photo.value = null;
  detailsInfo.value = null;
  carPointDTOList.value = [];
  passProject = []; // 通过项目
  dedProject = []; // 扣分项目
  runningDetails = []; // 流水明细
};

const projectMap = function (item) {
  const { itemName } = item;

  if (km == 2) {
    if (itemName.includes("倒车")) {
      return { ...item, itemName: "倒库" };
    } else if (itemName.includes("坡道")) {
      return { ...item, itemName: "坡起" };
    } else if (itemName.includes("侧方")) {
      return { ...item, itemName: "侧方" };
    } else if (itemName.includes("曲线")) {
      return { ...item, itemName: "曲线" };
    } else if (itemName.includes("直角")) {
      return { ...item, itemName: "直角" };
    } else {
      return item;
    }
  }
  return item;
};

// 流水发生变化时滚动到底部
watch(carPointDTOList, (o, n) => {
  if (o.length !== n.length) {
    nextTick(() => {
      const tds = document.querySelector(".tds");
      if (tds) {
        tds.scrollTop = tds.scrollHeight;
      }
    });
  }
});

const carInfo = function () {
  return new Promise(function (resolve, reject) {
    const { id, examinee, status, examNo } = carMap[dCarId];

    examCarInfo({ examId, carCode: hphm1, cardId: id, status }).then((res) => {
      // 获取考试项目
      project.value = res.itemList ? res.itemList.map(projectMap) : [];
      projectList = res.itemList || [];
      // 处理流水
      handleCarDetails(carInfol.details);

      if (res && examinee === res.name) {
        // 获取实时协议考试次数
        detailsInfo.value = { ...res, examNo };

        // 获取图片
        if (res.photo) {
          photo.value = `data:image/png;base64,${res.photo}`;
        }
      } else {
        // 重置状态
        reset();
      }
      // 车载视频
      const { channel, equipment } = res;

      if (channel && equipment) {
        const { tdh } = channel;
        const { yhm, wldz, mm, dk, sblx } = equipment;
        const url = getWebRtcRtspUrl({ tdh, wldz, yhm, mm }, sblx);

        if (url !== playUrl.value) {
          play.$patch({
            url,
            key: Date.now()
          });
          console.log(`车载视频地址：${url}`);
        } else if (!url && !playUrl) {
          console.error("视频类型地址错误");
        }
      }

      resolve();
    });
  });
};

const format = "HH:mm:ss";
const calcTime = function (startTime, endTime = Date.now()) {
  timeLong.value = formatDiffDuration(startTime, endTime, format);
};

// 计算时长
let time;
const timeLong = ref("--");
watch(
  () => detailsInfo.value,
  (val) => {
    // 清除定时器
    clearInterval(time);
    if (val) {
      const { examStatus, startTIme, endTime } = unref(detailsInfo);
      // 考试中计算实时时长
      const start = toUnix(startTIme);
      if (examStatus === "1") {
        time = setInterval(calcTime, 1000, start);
      } else if (examStatus === "2") {
        calcTime(start, toUnix(endTime));
      } else {
        timeLong.value = "--";
      }
    } else {
      timeLong.value = "--";
    }
  }
);

// 返回上级取消视频播放 取消详情定时器
watch(getSideBack, (val) => {
  if (!val) {
    dCarId = null;
    play.$patch({
      url: null
    });
    reset();
    clearTimeout(upDateCarTimer);
  }
});

// 页面卸载时清除
onUnmounted(() => {
  clearInterval(time);
  clearTimeout(upDateCarTimer);
});

// 点击查看详情 status 连接状态
const targetCar = function ({ hphm, syzjcx, kcbh }, status) {
  if (status === 4 || status === 5) {
    ElMessage({
      message: status === 4 ? "车辆未连接" : "车辆已停用",
      type: "warning"
    });
    return;
  }
  hphm1 = hphm;
  dCarId = `${syzjcx}-${Number(kcbh)}`;
  dCarIds = `${syzjcx}-${kcbh}`;

  // 缓存本次实时数据
  if (carMap[dCarId]) {
    carInfol = cloneDeep(carMap[dCarId]);
    // 进入详情
    carInfo().then(trigger);
  } else {
    trigger();
  }
  // 3d交互查看
  webMessagePort.postMessage(stringify({ type: "examCar", number: dCarIds }));
};

// 计算人工评判高度
const details = ref();
const handleMouseEnter = function ({ target }) {
  const btn = target.getBoundingClientRect();
  const { y } = details.value?.getBoundingClientRect();
  height.value = btn.y - y - 24;
};

// 获取考试项目状态颜色
const projectClass = function (code) {
  // 当前项目
  if (code === currentProject) {
    return "dq";
  }

  // 已完成且无扣分项目
  if (passProject.includes(code)) {
    return "tg";
  }

  // 已完成且扣分项目
  if (dedProject.includes(code)) {
    return "kf";
  }

  // 未完成项目
  return "wg";
};

// 考试状态
const examStatus = function (status) {
  let text;
  switch (status) {
    case 0:
      text = "空闲中";
      break;
    case 1:
      text = "已分配";
      break;
    case 2:
      text = "考试中";
      break;
    case 3:
      text = "考试结束";
      break;
    default:
      text = "未知状态";
      break;
  }
  return text;
};

const ts = ref();
const style = useNodeScrollStyle(ts);

usePolling(getExamCarList);

// 获取车辆状态
// 考试状态 0表示未进行考试， 1 表示分配完成， 2 表示考试中， 3 表示考试结束 ， 5 表示停用
const getCarStatus = function (i) {
  const status = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  Object.keys(carMap).forEach((key) => {
    const item = carMap[key];

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

  return status[i];
};

const { addModalSet, setModalParam } = modal;

// 监听3d消息
onMounted(() => {
  webMessagePort.onmessage = function (msg) {
    console.log(`webgl所传id:${msg.data}`);
    if (!msg.data.type) {
      const findData = unref(data).find(
        ({ syzjcx, kcbh }) => `${syzjcx}-${kcbh}` === msg.data
      );
      if (findData) {
        const { hphm, syzjcx, kcbh } = findData;
        hphm1 = hphm;
        dCarId = `${syzjcx}-${Number(kcbh)}`;
        dCarIds = `${syzjcx}-${kcbh}`;

        if (carMap[dCarId]) {
          carInfol = cloneDeep(carMap[dCarId]);
          // 进入详情
          carInfo().then(trigger);
        } else {
          trigger();
        }
      } else {
        console.log(`未查询到所传id:${msg.data}`);
      }
    } else if (msg.data.type === "warn") {
      addModalSet(0);
      setModalParam(msg.data.data);
    }
  };
});

// 暂停考试
const examPause = function (status) {
  ElMessageBox.confirm(`确定要${status === "A" ? "继续" : "暂停"}考试吗?`, "", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(() => {
      examCarUpdateStatus({ examId, carCode: hphm1, status }).then(carInfo);
    })
    .catch(() => {});
};
</script>
<template>
  <page-transition>
    <!-- 列表 -->
    <div
      class="float-left w-50% box-border p-10px flex justify-between flex-wrap"
    >
      <div
        v-for="(item, index) in menuTitle"
        @click="count = index"
        :key="index"
        :class="[{ active: count === index }]"
        class="menu-item w-30% h-30px cursor-pointer text-center color-white font-size-12px"
      >
        {{ item }} {{ getCarStatus(index) }}
      </div>
      <div class="w-100% m-t-15px m-b-5px">
        <el-input
          v-model="from.carId"
          placeholder="车辆编号"
          class="input-with-select"
        >
          <template #prepend>
            <el-select
              style="width: 80px"
              clearable
              v-model="from.carType"
              placeholder="车型"
            >
              <el-option
                v-for="carType in carTypeList"
                :key="carType"
                :label="carType"
                :value="carType"
              />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>
      <ul class="title-o flex w-100% flex-justify-between m-t-15px">
        <li class="w-60px">编号</li>
        <li class="w-70px">考生姓名</li>
        <li class="w-30px">预警</li>
        <li class="w-45px">合格率</li>
        <li class="w-60px">连接状态</li>
      </ul>
      <div
        ref="containerCarList"
        :style="containerCarStyle"
        class="container-list w-100%"
      >
        <div
          v-for="(item, index) in carList"
          :key="index"
          @click="targetCar(item, carMap[item.carId].status)"
          class="w-100% car-list cursor-pointer color-white h-42px m-t-8px flex justify-between items-center box-border p-l-15px p-r-15px"
        >
          <div class="w-60px">{{ item.syzjcx }}-{{ item.kcbh }}</div>
          <div class="w-70px">{{ carMap[item.carId].examinee || "--" }}</div>
          <div v-if="item.warn && item.warn > 5" class="warn">
            {{ item.warn }}
          </div>
          <div class="w-30px h-26px" v-else></div>
          <div class="w-45px">{{ item.carPassrate }}%</div>
          <!-- <el-progress
            striped-flow
            :width="36"
            color="#09acb0"
            :stroke-width="4"
            type="circle"
            :percentage="item.carPassrate"
          /> -->
          <div class="w-60px">
            <!-- <img class="w-25px block m-auto" :src="car" alt="" /> -->
            <p
              v-if="
                carMap[item.carId].status !== 4 &&
                carMap[item.carId].status !== 5
              "
              class="zt font-size-10px text-right"
            >
              已连接
            </p>
            <p v-else class="ztc font-size-10px text-right">未连接</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 详情 -->
    <div
      ref="details"
      class="w-50% box-border p-10px float-left position-relative"
    >
      <p class="status" v-if="dCarId">
        {{ examStatus(carMap[dCarId].status) }}
      </p>
      <div class="w-100%">
        <div
          v-if="dCarIds && !detailsInfo"
          class="nav-title flex p-t-5px p-b-5px box-border"
        >
          <h2 class="color-white text-left flex-1">
            {{ dCarIds }}
          </h2>
          <h2 class="color-white text-right flex-1"></h2>
        </div>
        <div v-if="detailsInfo">
          <div class="nav-title flex p-t-5px p-b-5px box-border">
            <h2 class="color-white text-left flex-1">
              {{ dCarIds }}
            </h2>
            <h2 class="color-white text-right flex-1">
              {{ carMap[dCarId].examnum ? carMap[dCarId].examnum : "" }}分
            </h2>
          </div>
          <div
            class="car-content m-t-12px flex h-135px color-white font-size-14px"
          >
            <div class="w-30% m-r-12px h-100% bg-gray">
              <img v-if="photo" class="w-100% h-100%" :src="photo" />
            </div>
            <div
              class="flex-1 flex flex-wrap justify-between position-relative"
            >
              <p class="w-100% font-size-16px">{{ detailsInfo.name }}</p>
              <p class="w-100%">
                开始时间：{{ timeSplit(detailsInfo.startTIme) }}
              </p>
              <p class="w-100%">
                结束时间：{{ timeSplit(detailsInfo.endTime) }}
              </p>
              <p class="w-100%">考试时长：{{ timeLong }}</p>
              <p class="w-100%">考试次数：第{{ detailsInfo.examNo }}次</p>
            </div>
          </div>
          <div class="m-t-6px color-white font-size-14px">
            <div class="m-t-2px">流水号：{{ detailsInfo.id }}</div>
            <div class="m-t-2px">身份证号：{{ detailsInfo.cardCode }}</div>
            <div class="m-t-2px">考车号牌：{{ detailsInfo.carCode }}</div>
            <div class="m-t-2px">培训驾校：{{ detailsInfo.schoolName }}</div>
          </div>
          <div :style="style" ref="ts">
            <!-- 考试中展示考试项目 -->
            <ul
              v-if="carMap[dCarId].status === 2"
              class="exam-project flex mt-10px mb-10px flex-wrap"
            >
              <li
                :class="projectClass(item.itemCode)"
                v-for="(item, index) in project"
                :key="index"
              >
                {{ item.itemName }}
              </li>
            </ul>
            <div
              v-if="carMap[dCarId].status > 1"
              class="tds w-100% h-380px box-border p-6px border-rd-6px border-solid border-1px border-color-white color-white font-size-14px"
            >
              <div
                class="ml-4px mb-4px"
                v-for="(item, index) in carPointDTOList"
                :key="index"
              >
                {{ item }}
                <!-- <p>
                  {{ item.pointTime.split(" ")[1] }}
                  <span v-if="item.mark">扣{{ item.mark }}分</span>
                </p>
                <p>
                  {{ item }}
                </p> -->
              </div>
            </div>
            <div
              v-if="carMap[dCarId].status === 2"
              class="flex justify-between"
            >
              <div></div>
              <div>
                <!-- 暂停考试 -->
                <el-button
                  v-if="detailsInfo.syzt === 'A'"
                  @click="examPause('B')"
                  class="bg-#0054d7 m-t-14px button"
                  icon="el-icon-video-pause"
                  type="primary"
                  >暂停考试</el-button
                >
                <!-- 暂停考试 -->
                <el-button
                  v-if="detailsInfo.syzt === 'B'"
                  @click="examPause('A')"
                  class="bg-#0054d7 m-t-14px button"
                  icon="el-icon-video-pause"
                  type="primary"
                  >继续考试</el-button
                >
                <!-- 人工评判 -->
                <el-popover
                  popper-class="popper"
                  :teleported="false"
                  placement="top-start"
                  width="calc(100% - 10px)"
                  trigger="hover"
                >
                  <template #reference>
                    <el-button
                      @mouseenter="handleMouseEnter"
                      class="bg-#0054d7 m-t-14px button"
                      :icon="Avatar"
                      type="primary"
                      >人工评判</el-button
                    >
                  </template>
                  <template #default>
                    <judge-radio
                      :id="detailsInfo.id"
                      :height="height"
                    ></judge-radio>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </page-transition>
</template>
<style scoped lang="less">
.button {
  background-color: unset;
  background-image: url("~/image/button-bg.png");
  background-size: 100% 100%;
  border: none !important;
  border-radius: 0;
}
:deep(.el-input-group__prepend) {
  background-color: unset;
  border-radius: 0;
}

:deep(.el-input__wrapper) {
  background-color: unset;
  box-shadow: 1px 0 0 0 #09acb0 inset, 0 1px 0 0 #09acb0 inset,
    0 -1px 0 0 #09acb0 inset !important;
}

:deep(.el-input-group__append) {
  border-radius: 0;
  background-color: unset;
  box-shadow: 0 1px 0 0 #09acb0 inset, 0 -1px 0 0 #09acb0 inset,
    -1px 0 0 0 #09acb0 inset !important;
  color: #09acb0;
}

.title-o {
  color: white;
  box-sizing: border-box;
  padding: 4px 15px;
  background: #0a65724f;
}

.red {
  color: #ff6969;
}

.menu-item {
  background-image: url("~/image/car-tab-t.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-bottom: 4px;
  line-height: 30px;
  font-style: italic;
}

.menu-item:nth-child(n + 4) {
  margin-bottom: 0;
}

.active {
  background-image: url("~/image/car-tab-s.png");
}

:deep(.el-input__inner::placeholder) {
  color: white;
}

.car-list {
  background: #0a65724f;
  .ztc {
    position: relative;
    color: #ff6969;
    font-size: 14px;
    &::after {
      content: "";
      position: absolute;
      width: 8px;
      height: 8px;
      top: 0;
      bottom: 0;
      margin: auto;
      left: 0px;
      background: #ff6969;
      z-index: 99;
      border-radius: 50%;
    }
  }
  .zt {
    color: #21df95;
    position: relative;
    font-size: 14px;
    &::after {
      content: "";
      position: absolute;
      width: 8px;
      height: 8px;
      top: 0;
      bottom: 0;
      margin: auto;
      left: 0px;
      background: #21df95;
      z-index: 99;
      border-radius: 50%;
    }
  }
  &:hover {
    background: #00feed73;
    // box-shadow: inset 0 0 15px #03eff3;
  }
  .warn {
    width: 30px;
    height: 26px;
    text-align: center;
    line-height: 26px;
    color: white;
    font-size: 10px;
    background-image: url("~/image/warning.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
}
.status {
  padding: 2px 4px;
  width: 60px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background: #00a5bd;
  position: absolute;
  top: 64px;
  right: 10px;
  // border: 1px solid white;
}

:deep(.el-progress__text) {
  font-size: 0.6rem !important;
  color: white;
  min-width: auto;
}

:deep(
    .el-input-group--prepend
      .el-input-group__prepend
      .el-select
      .el-input.is-focus
      .el-input__wrapper
  ) {
  border-radius: 0;
  box-shadow: 1px 0 0 0 #09acb0 inset, 1px 0 0 0 #09acb0,
    0 1px 0 0 #09acb0 inset, 0 -1px 0 0 #09acb0 inset !important;
}

:deep(.el-select__caret) {
  color: white !important;
}

:deep(
    .el-input-group--prepend
      .el-input-group__prepend
      .el-select:hover
      .el-input__wrapper
  ) {
  box-shadow: 1px 0 0 0 #09acb0 inset, 1px 0 0 0 #09acb0,
    0 1px 0 0 #09acb0 inset, 0 -1px 0 0 #09acb0 inset !important;
}

:deep(.el-select .el-input_wrapper.is-focus) {
  box-shadow: 0 0 0 1px #09acb0 inset !important;
}

.nav-title {
  // border-bottom: 1px solid white;
  position: relative;
  ::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0px;
    width: 100%;
    height: 2px; /* 控制下边框的高度 */
    background: linear-gradient(
      244deg,
      rgba(255, 255, 255, 0) 0,
      rgb(0, 246, 255) 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }
}

.tds {
  overflow-y: scroll;
}
.container-list {
  position: relative;
  /* 针对Webkit内核（如Chrome、Safari） */
  &::-webkit-scrollbar {
    position: absolute;
    right: 10px;
    // display: block;
    width: 10px; /* 设置滚动条宽度 */
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5; /* 设置背景色 */
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888; /* 设置滑块颜色 */
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555; /* 当鼠标悬停在滑块上时的颜色 */
  }
}

.exam-project {
  display: flex;
  align-items: center;
  li {
    // width: 60px;
    // line-height: 28px;
    // height: 28px;
    padding: 2px 14px 2px 6px;
    text-align: center;
    // border: 1px black solid;
    // padding: 2px 10px;
    color: white;
    font-size: 14px;
    // border-radius: 4px;
    margin-right: 6px;
    margin-bottom: 6px;
    cursor: pointer;
    background-image: url("~/image/area_t.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    font-style: italic;
    // background: #e1e1e149;
  }
  .dq {
    font-size: 18px;
  }
  .kf {
    background-image: url("~/image/area_w.png");
  }
  .tg {
    background-image: url("~/image/area_s.png");
  }
  .wg {
    color: rgb(185, 185, 185);
  }
}
:deep(.el-popper) {
  background-color: #1b4769e3;
  border: none;
}

:deep(.el-popper.is-light .el-popper__arrow::before) {
  background-color: rgb(0, 62, 59);
}
</style>
