<script setup>
import * as echarts from "echarts";
import {
  ref,
  onMounted,
  unref,
  computed,
  reactive,
  onUnmounted,
  watchEffect,
  nextTick,
  watch
} from "vue";
import RollNumber from "@/components/RollNumber.vue";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { examStore } from "@/store/modules/exam";
import { playStore } from "@/store/modules/play";
import { useRouter } from "vue-router";
import { modalStore } from "@/store/modules/modal";
import logout from "@/assets/image/logout.png";
import tj from "@/assets/image/tj.png";
import nodata from "@/assets/image/nodata.png";
import dz from "@/assets/image/dz.png";
import usePolling from "@/hooks/usePolling";
import { removeToken } from "@/utils/auth";
import ModalBox from "../exam/modal.vue";
import ScreenView from "../exam/sidecontent/components/ScreenView.vue";
import Scenes from "./scenes.vue";

import {
  options,
  mapGetOptions,
  warnGetOptions,
  subjectGetOptions,
  getDeductOptions,
  getAbroadOptions,
  getCandidateOptions
} from "./index.js";
import {
  getWarn,
  getExamMange,
  getExamMangeFurther,
  getExamSubject,
  getExamSubjectFurther,
  getExamSubjectTrend,
  getExamRoomInfo,
  getExamCar,
  getPoint,
  getExamIneesNum,
  getExamRoomWran,
  getWarnFurther,
  getExamResults,
  getExamAge,
  getExamPlace,
  getExamSex,
  getExamVehicle,
  examAreaTree
} from "@/api/index";
import MapCenter from "./center.vue";
import OverseasCandidates from "./dataanalysis/overseascandidates.vue";
import { useMessageChannel } from "@/hooks/useChannel";

const parentEnv = document.querySelector("#app").getAttribute("env");

const warnRef = ref();
const warnRef1 = ref();
const warnRef2 = ref();
const warnRef3 = ref();

const exam = examStore();

const play = playStore();

const { push } = useRouter();

const modal = modalStore();
const { addModalSet, setModalParam } = modal;

// 重置考场状态
exam.$patch({
  id: null,
  kcdddm: null,
  km: null
});

play.$patch({
  url: null
});

// 预警
const warnData = reactive({
  ll: { 1: 0, 2: 0, 3: 0 },
  km2: { 1: 0, 2: 0, 3: 0 },
  km3: { 1: 0, 2: 0, 3: 0 }
});
let warn, warn1, warn2, kmllRate, km2Rate, km3Rate;

onMounted(() => {
  warn = echarts.init(unref(warnRef));
  warn1 = echarts.init(unref(warnRef1));
  warn2 = echarts.init(unref(warnRef2));
});

const handleWarn = function (run) {
  getWarn().then((res) => {
    warnData.ll = { 1: 0, 2: 0, 3: 0 };
    warnData.km2 = { 1: 0, 2: 0, 3: 0 };
    warnData.km3 = { 1: 0, 2: 0, 3: 0 };

    kmllRate = km2Rate = km3Rate = 0;

    if (res && res.kmllList) {
      kmllRate = res.kmllRate;
      res.kmllList.forEach((item, index) => {
        warnData.ll[index + 1] = res.kmllList[index].data;
      });
    }
    if (res && res.km2List) {
      km2Rate = res.km2Rate;
      res.km2List.forEach((item, index) => {
        warnData.km2[index + 1] = res.km2List[index].data;
      });
    }
    if (res && res.km3List) {
      km3Rate = res.km3Rate;
      res.km3List.forEach((item, index) => {
        warnData.km3[index + 1] = res.km3List[index].data;
      });
    }
    warnGetOptions(echarts, warn, kmllRate, 1);
    warnGetOptions(echarts, warn1, km2Rate, 2);
    warnGetOptions(echarts, warn2, km3Rate, 3);
    run();
  });
};

usePolling(handleWarn, 15000);

// 考场考试安排
// const examArrange = reactive({
//   ll: { arrange: 0, total: 0 },
//   km2: { arrange: 0, total: 0 },
//   km3: { arrange: 0, total: 0 }
// });
// onMounted(() => {
//   getExamMange().then((res) => {
//     if (res.kmllList) {
//       examArrange.ll.arrange = res.kmllList[0].data;
//       examArrange.ll.total = res.kmllList[1].data;
//     }
//     if (res.km2List) {
//       examArrange.km2.arrange = res.km2List[0].data;
//       examArrange.km2.total = res.km2List[1].data;
//     }
//     if (res.km3List) {
//       examArrange.km3.arrange = res.km3List[0].data;
//       examArrange.km3.total = res.km3List[1].data;
//     }
//   });
// });

// 各科目考试进度
const examSchedule = reactive({
  ll: { arrange: 0, total: 0, ratio: 0, diff: 0 },
  km2: { arrange: 0, total: 0, ratio: 0, diff: 0 },
  km3: { arrange: 0, total: 0, ratio: 0, diff: 0 },
  km4: { arrange: 0, total: 0, ratio: 0, diff: 0 }
});
let maxSchedule = 0;

// 定时切换动画
const renderExamSubject = function (run) {
  let llRatio = 0,
    km2Ratio = 0,
    km3Ratio = 0,
    km4Ratio = 0;
  getExamSubject().then((res) => {
    if (res && res.kmllList) {
      examSchedule.ll.arrange = res.kmllList[0].data;
      examSchedule.ll.total = res.kmllList[1].data;
      examSchedule.ll.diff = res.kmllList[1].data - res.kmllList[0].data;
      examSchedule.ll.ratio = 0;
      llRatio =
        Math.floor((res.kmllList[0].data / res.kmllList[1].data) * 100) || 0;
    }
    if (res && res.km2List) {
      examSchedule.km2.arrange = res.km2List[0].data;
      examSchedule.km2.total = res.km2List[1].data;
      examSchedule.km2.diff = res.km2List[1].data - res.km2List[0].data;
      examSchedule.km2.ratio = 0;
      km2Ratio =
        Math.floor((res.km2List[0].data / res.km2List[1].data) * 100) || 0;
    }
    if (res && res.km3List) {
      examSchedule.km3.arrange = res.km3List[0].data;
      examSchedule.km3.total = res.km3List[1].data;
      examSchedule.km3.diff = res.km3List[1].data - res.km3List[0].data;
      examSchedule.km3.ratio = 0;
      km3Ratio =
        Math.floor((res.km3List[0].data / res.km3List[1].data) * 100) || 0;
    }
    if (res && res.km4List) {
      examSchedule.km4.arrange = res.km4List[0].data;
      examSchedule.km4.total = res.km4List[1].data;
      examSchedule.km4.diff = res.km4List[1].data - res.km4List[0].data;
      examSchedule.km4.ratio = 0;
      km4Ratio =
        Math.floor((res.km4List[0].data / res.km4List[1].data) * 100) || 0;
    }
    maxSchedule = Math.max(
      examSchedule.ll.total,
      examSchedule.km2.total,
      examSchedule.km3.total,
      examSchedule.km4.total
    );
    setTimeout(() => {
      examSchedule.ll.ratio = llRatio;
      examSchedule.km2.ratio = km2Ratio;
      examSchedule.km3.ratio = km3Ratio;
      examSchedule.km4.ratio = km4Ratio;
    }, 1000);
    run();
  });
};

// 定时轮询
usePolling(renderExamSubject, 30000);

// 考试科目合格率
const qualifiedRef = ref();
const examSubjectTrend = { label: [], ll: [], km2: [], km3: [] };
const getName = (data) => {
  if (!data.length) return null;
  return data.map((item) => item.name);
};
const getData = (data) => data.map((item) => item.data);

// 初始化图表节点
// let qualified;
// onMounted(() => {
//   qualified = echarts.init(unref(qualifiedRef));
// });

// const renderExamSubjectTrend = function (run) {
//   getExamSubjectTrend().then((res) => {
//     if (res) {
//       qualified.clear();
//       examSubjectTrend.label =
//         getName(res.kmllList) || getName(res.km2List) || getName(res.km3List);
//       examSubjectTrend.ll = getData(res.kmllList);
//       examSubjectTrend.km2 = getData(res.km2List);
//       examSubjectTrend.km3 = getData(res.km3List);
//       qualified.setOption(subjectGetOptions(examSubjectTrend), true);
//     }
//     run();
//   });
// };

// 定时轮询
// usePolling(renderExamSubjectTrend, 30000);

/*------------------车辆合格率------------------*/
// 车辆合格率排行 自动滚动
// const carScrollRef = ref();
// const carScrollRef1 = ref();
// // 车辆合格率排行 科目二 科目三 激活状态
// // 获取数据
// const carPassRate = reactive({ km2: [], km3: [] });

// let km2l = false,
//   km3l = false;
// usePolling((run) => {
//   getExamCar().then((res) => {
//     carPassRate.km2 = [];
//     carPassRate.km3 = [];
//     if (res && res.subjectTwo) {
//       if (!km2l) {
//         nextTick(() => {
//           km2l = true;
//           useAutoScroll(unref(carScrollRef), 5000);
//         });
//       }
//       carPassRate.km2 = res.subjectTwo;
//     } else {
//       km2l = false;
//     }
//     if (res && res.subjectThree) {
//       if (!km3l) {
//         nextTick(() => {
//           km3l = true;
//           useAutoScroll(unref(carScrollRef1), 5000);
//         });
//       }
//       carPassRate.km3 = res.subjectThree;
//     } else {
//       km3l = false;
//     }
//     run();
//   });
// });

/*------------------考生情况统计分析------------------*/
const passStatus = ref(-1);
let isMouseSitu = false;
// 扣分自动切换科目
onMounted(() => {
  // timerDeduct = setInterval(() => {
  //   if (isMouseSitu) return;
  //   passStatus.value = (passStatus.value + 1) % 4;
  // }, 15000);
});

// 清除定时器
onUnmounted(() => {
  clearInterval(timerDeduct);
});

/*------------------扣分分析------------------*/
// 扣分分析 科目二 科目三 激活状态
const deductStatus = ref(true);
const deductPie1Ref = ref();
const deductPie2Ref = ref();
const pointData = reactive({ km2: [], km3: [] });
let deduct1Data = [],
  deduct2Data = [];

let deduct1, deduct2;
// 页面初次加载请求扣分数据
usePolling((run) => {
  getPoint().then((res) => {
    pointData.km2 = [];
    pointData.km3 = [];
    deduct1Data = [];
    deduct2Data = [];

    if (res.km2) {
      pointData.km2 = res.km2.pointList;
      deduct1Data = res.km2.pointItemList.map((item) => {
        return {
          name: `${item.itemName}  ${item.scale}%`,
          value: item.scale
        };
      });
    }
    if (res.km3) {
      pointData.km3 = res.km3.pointList;
      deduct2Data = res.km3.pointItemList.map((item) => {
        return {
          name: `${item.itemName}  ${item.scale}%`,
          value: item.scale
        };
      });
    }
    // 数据加载成功后渲染图表
    nextTick(() => {
      if (unref(deductPie1Ref)) {
        if (!deduct1) {
          deduct1 = echarts.init(unref(deductPie1Ref));
        }
        deduct1.setOption(getDeductOptions(deduct1Data, unref(deductPie1Ref)));
      }
      if (unref(deductPie2Ref)) {
        if (!deduct2) {
          deduct2 = echarts.init(unref(deductPie2Ref));
        }
        deduct2.setOption(getDeductOptions(deduct2Data, unref(deductPie2Ref)));
      }
    });
    run();
  });
}, 15000);

let timerDeduct,
  isMouseDed = false;
// 扣分自动切换科目
onMounted(() => {
  timerDeduct = setInterval(() => {
    if (isMouseDed) return;
    deductStatus.value = !unref(deductStatus);
  }, 15000);
});

// 清除定时器
onUnmounted(() => {
  clearInterval(timerDeduct);
});

/**-------------------侧边栏------------------ */
// 侧边栏展开状态
const siderStatus = ref(0);
// 侧边栏动画
const transFormSideStyle = computed(() => {
  return { transform: `translateX(-${unref(siderStatus) ? 0 : "100%"})` };
});
// 点击外部隐藏侧边栏
const handleQutside = function () {
  const { x } = document.querySelector(".sidebar").getBoundingClientRect();

  if (unref(siderStatus) && x === 0) {
    siderStatus.value = 0;
  }
};

// 考场考试安排
const sideExamStatus = ref(0);
const examData = ref([]);
// 点击筛选
const handleExamRoom = function (count) {
  sideExamStatus.value = count;
};
// 筛选后数据
const filterExamData = computed(() =>
  unref(examData).filter(
    (item) =>
      unref(sideExamStatus) === 0 ||
      (unref(sideExamStatus) && item.kskm === unref(sideExamStatus))
  )
);

// 安排考试进行跳转
const handleExamMents = function (rows) {
  const { status, kcxh, kcdddh, kskm } = rows;
  if (status != 0) {
    exam.$patch({
      id: kcxh,
      kcdddm: kcdddh,
      km: kskm
    });
    push("/exam");
  }
};

// 各科目考试进度
const sideSubjectStatus = ref(0);
const subjectData = ref([]);
let subjectMax = 0;
// 点击筛选
const handleSubject = function (count) {
  sideSubjectStatus.value = count;
};
// 筛选后数据
const filterSubjectData = computed(() =>
  unref(subjectData).filter(
    (item) =>
      unref(sideSubjectStatus) === 0 ||
      (unref(sideSubjectStatus) && item.kskm === unref(sideSubjectStatus))
  )
);

// 预警信息
const sideWarnStatus = ref(0);
const warnsData = ref([]);

const filterWarnsData = computed(() =>
  unref(warnsData).filter(
    (item) =>
      unref(sideWarnStatus) === 0 ||
      (unref(sideWarnStatus) && item.km == unref(sideWarnStatus))
  )
);

const handleWran = function (count) {
  sideWarnStatus.value = count;
};

const handleWarnDetails = function (row) {
  const { kcxh, km } = row;

  exam.$patch({
    id: kcxh,
    km
  });
  addModalSet(1);
};

const handleWarnFurther = function (run) {
  getWarnFurther().then((res) => {
    warnsData.value = res;
    run();
  });
};

usePolling(handleWarnFurther, 30000);

onMounted(() => {
  getExamMangeFurther().then((res) => {
    examData.value = res;
  });
  getExamSubjectFurther().then((res) => {
    subjectMax = Math.max(...res.map((item) => item.total));
    subjectData.value = res.map((item) => {
      return {
        ...item,
        rate: Math.floor((item.ykrs / item.total || 0) * 100)
      };
    });
  });
});

//计算宽度
const calcProgressStyle = function (n, t) {
  const l = n / t;
  return { width: `calc(${(n / t) * 100}% + ${(1 - l) * 80}px)` };
};

// 横向滚动
const transFormStyle = function (status) {
  return { transform: `translateX(-${status ? 0 : "50%"})` };
};

// 多个横向滚动
const transFormStyles = function (n) {
  return { transform: `translateX(-${n * 25}%)` };
};

// 退出
const handleLogout = function () {
  ElMessageBox.confirm("确定要退出吗?", "", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(() => {
      removeToken();
      location.href = "/";
    })
    .catch(() => {});
};

const t = "无";
const subjectResult = reactive([
  { name: "科目一", passRate: t, A: t, B: t, C: t, F: t },
  { name: "科目二", passRate: t, A: t, B: t, C: t, F: t },
  { name: "科目三", passRate: t, A: t, B: t, C: t, F: t },
  { name: "科目三安全文明驾驶", passRate: t, A: t, B: t, C: t, F: t }
]);
// 考试结果统计
const examResults = function (run) {
  getExamResults().then((res) => {
    if (res) {
      // 总合格率
      subjectResult[0].passRate =
        res.km1PassRate >= 0 ? res.km1PassRate + "%" : t;
      subjectResult[1].passRate =
        res.km2PassRate >= 0 ? res.km2PassRate + "%" : t;
      subjectResult[2].passRate =
        res.km3PassRate >= 0 ? res.km3PassRate + "%" : t;
      subjectResult[3].passRate =
        res.km4PassRate >= 0 ? res.km4PassRate + "%" : t;
      // 科目一
      (res.km1List || []).forEach((item) => {
        subjectResult[0][item.reason] = item.scale + "%";
      });
      // 科目二
      (res.km2List || []).forEach((item) => {
        subjectResult[1][item.reason] = item.scale + "%";
      });
      // 科目三
      (res.km3List || []).forEach((item) => {
        subjectResult[2][item.reason] = item.scale + "%";
      });
      // 科目四
      (res.km4List || []).forEach((item) => {
        subjectResult[3][item.reason] = item.scale + "%";
      });
    }
    run();
  });
};
usePolling(examResults, 15000);

const visible = ref(false);
const examKcdd = ref(null);
const examKm = ref(null);
const examroomName = ref(null);

const handleIndoorWebgl = function (map) {
  visible.value = true;
  examKcdd.value = map.kcdddh;
  examKm.value = map.subject;
  examroomName.value = map.examroomName;
  examAreaTree(map.examroomId).then((res) => {
    // menus.value = res;
    isload.value = true;
  });
};

// ---------考生情况统计分析------------
// 年龄
const examAgeData = ref([]);
const getExamAgency = function (run) {
  getExamAge().then((res) => {
    if (res) {
      examAgeData.value = res;
    }
    run();
  });
};
usePolling(getExamAgency, 15000);

// 性别
const examSexData = ref([]);
const getExamSexncy = function (run) {
  getExamSex().then((res) => {
    if (res) {
      examSexData.value = res.filter(
        (item) => item.remark == "男" || item.remark == "女"
      );
    }

    run();
  });
};
usePolling(getExamSexncy, 15000);

// 异地
const locationRef = ref();
const examOffData = reactive({ number: 0, rate: 0, list: [] });
const getExamOffncy = function (run, args) {
  const locationEcharts = (args && args[0]) || echarts.init(unref(locationRef));
  getExamPlace().then((res) => {
    if (res) {
      examOffData.number = res.number;
      examOffData.rate = res.rate;
      locationEcharts.setOption(
        getAbroadOptions(
          res.list.map((item) => ({
            name: item.city,
            value: item.personNumber
          }))
        )
      );
    }
    run(locationEcharts);
  });
};
usePolling(getExamOffncy, 15000);

// 车型
const examCarData = ref([]);
const getExamCarncy = function (run) {
  getExamVehicle().then((res) => {
    if (res) {
      examCarData.value = res;
    }
    run();
  });
};
usePolling(getExamCarncy, 15000);

const handleClose = function () {
  visible.value = false;
};

const isload = ref(false);

const { webMessagePort, stringify } = useMessageChannel();

const progress = ref(0);
const nextWeb = ref(1);

let loadCount = 0;

const examAreaCodes = [`FK001-2`, `FK007-2`];

console.log(parentEnv);

examAreaCodes.push(parentEnv == "wy" ? "FK007-3" : "5223303-3");

const webload = function (progress1) {
  if (progress1 === 100) {
    setTimeout(() => {
      progress.value = parseInt((100 / examAreaCodes.length) * loadCount);
      nextWeb.value = nextWeb.value + 1;
    }, 150);
  }
  console.log(`%c模型加载进度：${progress1}`, "color: blue;");
};

const handleWebglLoaded = function () {
  // const { examKcdd, examKm } = props;
  // console.log(`初始化场景web端传入考场id:${examKcdd}-${examKm}`);

  webMessagePort.postMessage(
    stringify({
      type: "init",
      examAreaCode: examAreaCodes[loadCount++]
    })
  );
  window.loadScene = webload;
};

const glCount = ref(0);

const prev = function () {
  if (glCount.value > 0) {
    glCount.value--;
  }
};

const next = function () {
  if (glCount.value < 3) {
    glCount.value++;
  }
};

// 左侧菜单数据
const menus = ref([
  {
    name: "车管所大楼",
    buildName: "ZhuTi01",
    floor: null,
    roomName: null,
    subRegion: [
      {
        name: "科目二候考室",
        buildName: "ZhuTi01",
        floor: 1,
        roomName: "test1"
      },
      {
        name: "监控中心",
        buildName: "ZhuTi01",
        floor: 2,
        roomName: "jkzx"
      }
    ]
  },
  {
    name: "理论考试大楼",
    buildName: "ZhuTi02",
    floor: null,
    roomName: null,
    subRegion: [
      {
        name: "理论候考室",
        buildName: "ZhuTi02",
        floor: 1,
        roomName: "llhks"
      },
      {
        name: "理论自助考试区",
        buildName: "ZhuTi02",
        floor: 1,
        roomName: "llzzksq"
      },
      {
        name: "C5考试区",
        buildName: "ZhuTi02",
        floor: 1,
        roomName: "c5ksq"
      },
      {
        name: "理论考试区(二楼)",
        buildName: "ZhuTi02",
        floor: 2,
        roomName: "ll2"
      },
      {
        name: "理论考试区(三楼)",
        buildName: "ZhuTi02",
        floor: 3,
        roomName: "ll3"
      }
    ]
  },
  {
    name: "科目二考试场地",
    buildName: "init",
    floor: null,
    roomName: null,
    subRegion: []
  }
  // {
  //   name: "进入考场监管",
  //   buildName: "init",
  //   floor: null,
  //   roomName: null,
  //   subRegion: []
  // }
]);

let examRoomData = [];
const handleExamRoomData = function (e) {
  examRoomData = e;
};

webMessagePort.onmessage = function (msg) {
  if (msg.data.type === "router") {
    const kcdddm = msg.data.data.split("-")[0];
    const km = msg.data.data.split("-")[1];
    const examRoom = examRoomData.find(
      (item) => item.kcdddh == kcdddm && item.subject == km
    );

    if (examRoom) {
      exam.$patch({
        id: examRoom.examroomId,
        kcdddm,
        km
      });
      push("/exam");
    }
  }
};

// 菜单点击事件
const avtiveMenu = ref("");
const handleMenuCilck = function (item) {
  const { name, buildName, floor, roomName } = item;
  avtiveMenu.value = name;
  webMessagePort.postMessage(
    stringify({
      type: "changeView",
      buildName,
      examCode: "FK001-2",
      floor,
      roomName
    })
  );
};

const sitCount = ref(0);
const examAgeList = reactive([]);
const examSexList = reactive([]);
const examOffList = reactive([]);
const examCarList = reactive([]);

const title = ["理论考试", "科目二", "科目三", "科目三安全文明驾驶"];

onMounted(() => {
  for (let v = 0; v < 4; v++) {
    if (v == 0) {
      nextTick(() => {
        const dom = document.querySelector("#dw");
        const echartsRef = echarts.init(dom);
        const ages = ["18-25岁", "26-35岁", "36-45岁", "46-55岁", "56-70岁"];
        const data = [];
        setTimeout(() => {
          let t = 0;
          for (let i = 0; i < title.length; i++) {
            getExamAge(i + 1).then((res) => {
              examAgeList[i] = res;
              data[i] = [0, 0, 0, 0, 0];
              if (res.length) {
                ages.forEach((item) => {
                  res.forEach((item2, j) => {
                    if (item === item2.remark) {
                      data[i][j] = item2.total;
                    }
                  });
                });
              }
              if (++t == 4) {
                echartsRef.setOption(getCandidateOptions(ages, data, title));
              }
            });
          }
        }, 300);
      });
    }

    if (v == 1) {
      nextTick(() => {
        const dom = document.querySelector("#dw1");
        const echartsRef = echarts.init(dom);
        const data = [];
        const sexs = ["男", "女"];
        setTimeout(() => {
          let t = 0;
          for (let i = 0; i < title.length; i++) {
            getExamSex(i + 1).then((res) => {
              examSexList[i] = res || [];
              data[i] = [0, 0];
              if (res) {
                sexs.forEach((item) => {
                  res.forEach((item2, j) => {
                    if (item === item2.remark) {
                      data[i][j] = item2.total;
                    }
                  });
                });
              }

              if (++t == 4) {
                echartsRef.setOption(getCandidateOptions(sexs, data, title));
              }
            });
          }
        }, 300);
      });
    }

    if (v == 2) {
      nextTick(() => {
        const dom = document.querySelector("#off");
        const echartsRef = echarts.init(dom);
        setTimeout(() => {
          let t = 0;
          let xdata = [];
          const data = [];
          for (let i = 0; i < title.length; i++) {
            getExamPlace(i + 1).then((res) => {
              examOffList[i] = res || [];

              if (res) {
                res.list.forEach((item) => {
                  if (!xdata.includes(item.city)) {
                    xdata.push(item.city);
                  }
                });
              }

              if (++t == 4) {
                examOffList.forEach((item, i) => {
                  data[i] = new Array(xdata.length).fill(0);
                  for (let j = 0; j < item.list.length; j++) {
                    if (xdata.includes(item.list[j].city)) {
                      data[i][j] = item.list[j].personNumber;
                    }
                  }
                });
                echartsRef.setOption(getCandidateOptions(xdata, data, title));
              }
            });
          }
        }, 300);
      });
    }

    if (v == 3) {
      nextTick(() => {
        const dom = document.querySelector("#cx");
        const echartsRef = echarts.init(dom);
        setTimeout(() => {
          let t = 0;
          let xdata = [];
          const data = [];
          for (let i = 0; i < title.length; i++) {
            getExamVehicle(i + 1).then((res) => {
              examCarList[i] = res || [];

              if (res) {
                res.forEach((item) => {
                  if (!xdata.includes(item.remark)) {
                    xdata.push(item.remark);
                  }
                });
              }

              if (++t == 4) {
                examCarList.forEach((item, i) => {
                  data[i] = new Array(xdata.length).fill(0);
                  for (let j = 0; j < item.length; j++) {
                    if (xdata.includes(item[j].remark)) {
                      data[i][j] = item[j].total;
                    }
                  }
                });

                echartsRef.setOption(getCandidateOptions(xdata, data, title));
              }
            });
          }
        }, 300);
      });
    }
  }
});

watch(passStatus, (v) => {
  sitCount.value = v;
});

const handleQutsides = function () {};

// 点击切换统计
const typeAnalysis = ref(0);
const transformActive = ref(false);
const handleDataAnalysis = (item) => {
  handleDataAnalysisCilck(0);
  transformActive.value = !unref(transformActive);
};
const handleDataAnalysisCilck = (item) => {
  typeAnalysis.value = item;
};
</script>
<template>
  <div class="main w-screen h-screen">
    <!-- 3d模型加载loading -->
    <div v-if="progress < 100" class="loading w-100% h-100% position-fixed">
      <div>
        <el-progress
          :text-inside="true"
          :percentage="progress"
          :stroke-width="24"
          striped-flow
          striped
        >
          <template #default="{ percentage }">
            <span>模型加载{{ percentage }}%</span>
          </template>
        </el-progress>
      </div>
    </div>
    <!-- 多个场景 -->
    <div
      :style="{ left: `-${glCount * 100}%` }"
      :class="{ 'web-active': passStatus >= 0, 'top-active': transformActive }"
      class="iframe h-100% w-400% position-absolute left-0% top-0 flex overflow-hidden"
    >
      <div class="w-25% h-100%">
        <div class="w-50% h-94% m-auto position-relative pb-20px top-6%">
          <map-center
            @indoorWebgl="handleIndoorWebgl"
            @examRoomData="handleExamRoomData"
          />
        </div>
      </div>
      <div class="w-25% h-100% position-relative">
        <ul class="menu">
          <li v-for="(menu, i) in menus" :key="i">
            <div
              @click="handleMenuCilck(menu)"
              :class="[{ activeleve1: avtiveMenu === menu.name }]"
              class="leve1"
            >
              {{ menu.name }}
            </div>
            <div
              @click="handleMenuCilck(sub)"
              :class="[{ activeleve2: avtiveMenu === sub.name }]"
              v-for="(sub, j) in menu.subRegion"
              :key="j"
              class="leve2"
            >
              {{ sub.name }}
            </div>
          </li>
        </ul>
        <iframe
          class="w-100% h-100%"
          @load="handleWebglLoaded"
          src="/digitalTwin/Index.html"
          frameborder="0"
        ></iframe>
      </div>
      <iframe
        v-if="nextWeb > 1"
        class="w-25% h-100%"
        @load="handleWebglLoaded"
        src="/digitalTwin/Index.html"
        frameborder="0"
      ></iframe>
      <iframe
        v-if="nextWeb > 2"
        class="w-25% h-100%"
        @load="handleWebglLoaded"
        src="/digitalTwin/Index.html"
        frameborder="0"
      ></iframe>
    </div>

    <!-- 内部场景3d -->
    <!-- <scenes
      v-if="visible"
      :examroomName="examroomName"
      :examKcdd="examKcdd"
      :examKm="examKm"
      @close="handleClose"
    ></scenes> -->
    <!-- 全屏弹框 -->
    <screen-view>
      <modal-box />
    </screen-view>
    <!-- 统计 -->
    <img
      @click="handleDataAnalysis"
      class="position-absolute right-112px top-4px cursor-pointer z-9999"
      style="width: 50px; height: 50px"
      :src="tj"
      alt=""
    />
    <!-- 退出 -->
    <img
      @click="handleLogout"
      class="w-85px h-35px position-absolute right-12px top-11px cursor-pointer z-9999"
      :src="logout"
      alt=""
    />
    <!-- 侧边栏 -->
    <div
      v-clickOutside="handleQutside"
      @mouseleave="siderStatus = 0"
      :style="transFormSideStyle"
      class="sidebar"
    >
      <div v-if="siderStatus == 1">
        <div class="title">各考场考试安排</div>
        <ul class="sideStatusBtn">
          <li
            :class="[{ active: sideExamStatus == 0 }]"
            @click="handleExamRoom(0)"
          >
            全部
          </li>
          <li
            :class="[{ active: sideExamStatus == 1 }]"
            @click="handleExamRoom('1')"
          >
            理论考试
          </li>
          <li
            :class="[{ active: sideExamStatus == 2 }]"
            @click="handleExamRoom('2')"
          >
            科目二
          </li>
          <li
            :class="[{ active: sideExamStatus == 3 }]"
            @click="handleExamRoom('3')"
          >
            科目三
          </li>
        </ul>
        <ul class="exam-room-list">
          <li
            @click="handleExamMents(item)"
            v-for="(item, index) in filterExamData"
            :key="index"
          >
            {{ index + 1 }})
            <span class="kc">{{ item.kcmc }}</span>
            <span class="status">{{
              item.status == 0 ? "无考试安排" : "有考试安排"
            }}</span>
          </li>
        </ul>
      </div>
      <div v-if="siderStatus == 2">
        <div class="title">各科目考试进度</div>
        <ul class="sideStatusBtn">
          <li
            :class="[{ active: sideSubjectStatus == 0 }]"
            @click="handleSubject(0)"
          >
            全部
          </li>
          <li
            :class="[{ active: sideSubjectStatus == 1 }]"
            @click="handleSubject('1')"
          >
            理论考试
          </li>
          <li
            :class="[{ active: sideSubjectStatus == 2 }]"
            @click="handleSubject('2')"
          >
            科目二
          </li>
          <li
            :class="[{ active: sideSubjectStatus == 3 }]"
            @click="handleSubject('3')"
          >
            科目三
          </li>
        </ul>

        <ul class="subject-list">
          <li>
            <div class="xh"></div>
            <div class="kc">考场名称</div>
            <div class="zb">已考人数/总人数</div>
          </li>
          <li
            @click="handleExamMents(item)"
            v-for="(item, index) in filterSubjectData"
            :key="index"
          >
            <div class="xh">{{ index + 1 }}</div>
            <div :title="item.kcmc" class="kc">{{ item.kcmc }}</div>
            <div class="zb position-relative">
              <el-progress
                :style="calcProgressStyle(item.total, subjectMax)"
                :stroke-width="10"
                :percentage="item.rate"
                color="#adff00"
              >
                <p class="w-80px"></p>
              </el-progress>
              <p
                class="font-size-12px text-right color-white w-80px position-absolute right-0"
              >
                {{ item.ykrs }}人/{{ item.total }}人
              </p>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="siderStatus == 3">
        <div class="title">预警信息</div>
        <ul class="sideStatusBtn">
          <li :class="[{ active: sideWarnStatus == 0 }]" @click="handleWran(0)">
            全部
          </li>
          <li :class="[{ active: sideWarnStatus == 1 }]" @click="handleWran(1)">
            理论考试
          </li>
          <li :class="[{ active: sideWarnStatus == 2 }]" @click="handleWran(2)">
            科目二
          </li>
          <li :class="[{ active: sideWarnStatus == 3 }]" @click="handleWran(3)">
            科目三
          </li>
        </ul>
        <ul class="warn-list">
          <li>
            <div class="xh"></div>
            <div class="kc font-size-16px">考场名称</div>
            <div class="zb">
              <div>
                <p>一级预警</p>
                <p>二级预警</p>
                <p>三级预警</p>
              </div>
              <div>已处置预警数量/未处置预警数量</div>
            </div>
          </li>
          <li
            v-for="(item, index) in filterWarnsData"
            :key="index"
            @click="handleWarnDetails(item)"
          >
            <div class="xh">{{ index + 1 }})</div>
            <div class="kc">{{ item.kcmc }}</div>
            <div class="zb">
              <div style="height: 40px">
                <p class="w-30%">
                  <span class="color-#9bd342">{{ item.level1ProcessNum }}</span
                  >/<span class="color-red">{{ item.level1Num }}</span>
                </p>
                <p class="w-30%">
                  <span class="color-#9bd342">{{ item.level2ProcessNum }}</span
                  >/<span class="color-red">{{ item.leve2Num }}</span>
                </p>
                <p class="w-30%">
                  <span class="color-#9bd342">{{ item.level3ProcessNum }}</span
                  >/<span class="color-red">{{ item.level3Num }}</span>
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 主屏 -->

    <div
      class="c w-100% h-6% font-size-9 color-white flex justify-center items-center font-900 position-relative z-100"
    >
      驾驶人考试数智化监管平台
      <div>
        <div
          v-if="transformActive"
          class="top-analysis"
          style="left: 220px"
          @click="handleDataAnalysisCilck(0)"
          :class="{ 'img-active': typeAnalysis == 0 }"
        >
          连续合格分析
        </div>
        <div v-if="transformActive" class="top-analysis" style="left: 400px">
          合格率分析
        </div>
        <div
          v-if="transformActive"
          class="top-analysis"
          style="right: 400px"
          @click="handleDataAnalysisCilck(2)"
          :class="{ 'img-active': typeAnalysis == 2 }"
        >
          异地考生分析
        </div>
        <div v-if="transformActive" class="top-analysis" style="right: 220px">
          异常业务分析
        </div>
      </div>
    </div>

    <div class="content">
      <div @click="prev" class="tap prev left-23%"></div>
      <div @click="next" class="tap next right-23%"></div>
      <div
        :class="{ 'left-active': transformActive }"
        class="w-23% h-100% position-relative z-100 st"
      >
        <!-- 今日预警 -->
        <div class="h-33.33%">
          <div class="sub-title">
            今日预警
            <span @click="siderStatus = 3" class="more">更多>></span>
          </div>
          <ul class="warn">
            <li>
              <p>理论考试</p>
              <div class="box">
                <div class="txt leve1">
                  <p class="font-size-18px font-700">{{ warnData.ll[1] }}</p>
                  <p class="font-size-12px">一级预警</p>
                </div>
                <div class="line"></div>
                <div class="txt leve2">
                  <p class="font-size-18px font-700">{{ warnData.ll[2] }}</p>
                  <p class="font-size-12px">二级预警</p>
                </div>
                <div class="line"></div>
                <div class="txt leve3">
                  <p class="font-size-18px font-700">{{ warnData.ll[3] }}</p>
                  <p class="font-size-12px">三级预警</p>
                </div>
              </div>
              <div ref="warnRef" class="echarts-t"></div>
            </li>
            <li>
              <p>科目二</p>
              <div class="box">
                <div class="txt leve1">
                  <p class="font-size-18px font-700">{{ warnData.km2[1] }}</p>
                  <p class="font-size-12px">一级预警</p>
                </div>
                <div class="line"></div>
                <div class="txt leve2">
                  <p class="font-size-18px font-700">{{ warnData.km2[2] }}</p>
                  <p class="font-size-12px">二级预警</p>
                </div>
                <div class="line"></div>
                <div class="txt leve3">
                  <p class="font-size-18px font-700">{{ warnData.km2[3] }}</p>
                  <p class="font-size-12px">三级预警</p>
                </div>
              </div>
              <div ref="warnRef1" class="echarts-t"></div>
            </li>
            <li>
              <p>科目三</p>
              <div class="box">
                <div class="txt leve1">
                  <p class="font-size-18px font-700">{{ warnData.km3[1] }}</p>
                  <p class="font-size-12px">一级预警</p>
                </div>
                <div class="line"></div>
                <div class="txt leve2">
                  <p class="font-size-18px font-700">{{ warnData.km3[2] }}</p>
                  <p class="font-size-12px">二级预警</p>
                </div>
                <div class="line"></div>
                <div class="txt leve3">
                  <p class="font-size-18px font-700">{{ warnData.km3[3] }}</p>
                  <p class="font-size-12px">三级预警</p>
                </div>
              </div>
              <div ref="warnRef2" class="echarts-t"></div>
            </li>
          </ul>
        </div>
        <!-- 考场考试安排 -->
        <!-- <div class="h-20%">
          <div class="sub-title">
            考场考试安排
            <span @click="siderStatus = 1" class="more">更多>></span>
          </div>
          <div class="exam-room">
            <div class="left">
              <div>理论考试考场</div>
              <div>科目二考场</div>
              <div>科目三考场</div>
            </div>
            <div class="right">
              <div class="tsd">
                有考试安排:<span>{{ examArrange.ll.arrange }}</span>
                /考场总数:<span>{{ examArrange.ll.total }}</span>
              </div>
              <div class="tsd">
                有考试安排:<span>{{ examArrange.km2.arrange }}</span>
                /考场总数:<span>{{ examArrange.km2.total }}</span>
              </div>
              <div>
                有考试安排:<span>{{ examArrange.km3.arrange }}</span>
                /考场总数:<span>{{ examArrange.km3.total }}</span>
              </div>
            </div>
            <ul>
              <li>
                <p class="top">
                  {{ examArrange.ll.arrange }}/{{ examArrange.ll.total }}
                </p>
                <img :src="dz" alt="" />
                <p class="bot">理论考试考场</p>
              </li>
              <li>
                <p class="top">
                  {{ examArrange.km2.arrange }}/{{ examArrange.km2.total }}
                </p>
                <img :src="dz" alt="" />
                <p class="bot">科目二考场</p>
              </li>
              <li>
                <p class="top">
                  {{ examArrange.km3.arrange }}/{{ examArrange.km3.total }}
                </p>
                <img :src="dz" alt="" />
                <p class="bot">科目三考场</p>
              </li>
            </ul>
          </div>
        </div> -->
        <!-- 各科目考试进度 -->
        <div class="h-33.33%">
          <div class="sub-title">
            各科目考试进度
            <span @click="siderStatus = 2" class="more">更多>></span>
          </div>
          <ul class="exam-progress">
            <li>
              <div class="flex flex-justify-around w-100% m-b-4px">
                <p class="font-size-14px flex-1">
                  理论考试（
                  <span class="font-size-12px"
                    >{{ examSchedule.ll.diff }}人未考</span
                  >
                  ）
                </p>
                <p
                  class="flex-1 font-size-12px text-right color-white w-90px"
                  text
                >
                  {{ examSchedule.ll.arrange }}人/{{ examSchedule.ll.total }}人
                </p>
              </div>

              <el-progress
                class="progress1"
                :stroke-width="10"
                :percentage="examSchedule.ll.ratio"
                color="#02f4ff"
              >
                <p text></p>
              </el-progress>
            </li>
            <li>
              <div class="flex flex-justify-around w-100% m-b-4px">
                <p class="font-size-14px">
                  科目二（
                  <span class="font-size-12px"
                    >{{ examSchedule.km2.diff }}人未考</span
                  >
                  ）
                </p>
                <p
                  class="flex-1 font-size-12px text-right color-white w-90px"
                  text
                >
                  {{ examSchedule.km2.arrange }}人/{{
                    examSchedule.km2.total
                  }}人
                </p>
              </div>

              <el-progress
                class="progress2"
                :stroke-width="10"
                :percentage="examSchedule.km2.ratio"
                color="#ffbf37"
              >
                <p text></p>
              </el-progress>
            </li>
            <li>
              <div class="flex flex-justify-around w-100% m-b-4px">
                <p class="font-size-14px">
                  科目三（
                  <span class="font-size-12px"
                    >{{ examSchedule.km3.diff }}人未考</span
                  >
                  ）
                </p>
                <p
                  class="flex-1 font-size-12px text-right color-white w-90px"
                  text
                >
                  {{ examSchedule.km3.arrange }}人/{{
                    examSchedule.km3.total
                  }}人
                </p>
              </div>
              <el-progress
                class="progress3"
                :stroke-width="10"
                :percentage="examSchedule.km3.ratio"
                color="#2a71ff"
              >
                <p text></p>
              </el-progress>
            </li>
            <li>
              <div class="flex flex-justify-around w-100% m-b-4px">
                <p class="font-size-14px flex-2">
                  科目三安全文明驾驶（
                  <span class="font-size-12px"
                    >{{ examSchedule.km4.diff }}人未考</span
                  >
                  ）
                </p>
                <p
                  class="flex-1 font-size-12px text-right color-white w-90px"
                  text
                >
                  {{ examSchedule.km4.arrange }}人/{{
                    examSchedule.km4.total
                  }}人
                </p>
              </div>

              <el-progress
                class="progress4"
                :stroke-width="10"
                :percentage="examSchedule.km4.ratio"
                color="#35b73d"
              >
                <p text></p>
              </el-progress>
            </li>
          </ul>
        </div>
        <!-- 科目合格率趋势图 -->
        <div class="h-33.33%">
          <div class="sub-title">考试结果统计(合格率)</div>
          <ul class="subject-result">
            <li class="title-sda">
              <div class="col-2">考试科目</div>
              <div class="col-1">初次申领</div>
              <div class="col-1">满分学习</div>
              <div class="col-1">增驾申领</div>
              <div class="col-1">补证换证</div>
            </li>
            <li v-for="(item, index) in subjectResult" :key="index">
              <div class="col-2">
                <div class="col-1">{{ item.name }}</div>
                <div class="col-1">{{ item.passRate }}</div>
              </div>
              <div class="col-1">{{ item.A }}</div>
              <div class="col-1">{{ item.F }}</div>
              <div class="col-1">{{ item.B }}</div>
              <div class="col-1">{{ item.C }}</div>
            </li>
          </ul>
        </div>
        <!-- <div class="h-25%">
          <div class="sub-title">科目合格率趋势图</div>
          <div ref="qualifiedRef" class="qualified"></div>
        </div> -->
      </div>
      <div
        :style="{ transform: `translateY(${passStatus * 25 * -1}%)` }"
        class="w-50% h-400% position-relative z-999"
      >
        <div v-clickOutside="handleQutsides" class="w-100% h-25% p-10px">
          <div class="h-66.666% flex flex-wrap">
            <div
              v-for="(item, index) in examAgeList"
              :key="index"
              class="w-49% h-50%"
              :style="{ marginRight: index % 2 == 0 ? '1%' : '0' }"
            >
              <div class="sub-bg-title text-center font-size-18px p-4px">
                {{ title[index] }}
              </div>
              <ul class="age-container" style="width: 100%" ref="ageRef">
                <li class="title">
                  <div class="w-80px">年龄</div>
                  <div class="col-1">预约人数及占比</div>
                  <div class="w-80px">合格率</div>
                </li>
                <li v-for="(jt, j) in item" :key="j">
                  <div class="w-80px">{{ jt.remark }}</div>
                  <div class="col-1">
                    <!-- <el-progress
                    class="progress"
                    :stroke-width="8"
                    :percentage="item.scale"
                    color="#35b73d"
                  >
                    <p text></p>
                  </el-progress> -->
                    {{ jt.scale }}%({{ jt.total }}人)
                    <!-- <div class="w-80px">
                    {{ item.scale }}%({{ item.total }}人)
                  </div> -->
                  </div>
                  <div class="w-80px">{{ jt.passRate }}%</div>
                </li>
              </ul>
            </div>

            <!-- <ul class="flex-1"></ul>
            <ul class="flex-1"></ul>
            <ul class="flex-1"></ul> -->
          </div>
          <div class="h-33.333% flex flex-wrap">
            <div id="dw" class="w-100% h-100%"></div>
          </div>
        </div>
        <div v-clickOutside="handleQutsides" class="w-100% h-25% p-10px">
          <div class="h-50% flex flex-wrap">
            <div
              v-for="(item, index) in examSexList"
              :key="index"
              class="w-49% h-50%"
              :style="{ marginRight: index % 2 == 0 ? '1%' : '0' }"
            >
              <div class="sub-bg-title text-center font-size-18px p-4px">
                {{ title[index] }}
              </div>
              <ul class="age-container" style="width: 100%" ref="ageRef">
                <li class="title">
                  <div class="w-80px">性别</div>
                  <div class="col-1">预约人数</div>
                  <div class="w-80px">合格率</div>
                </li>
                <li v-for="(jt, j) in item" :key="j">
                  <div class="w-80px">{{ jt.remark }}</div>
                  <div class="col-1">{{ jt.scale }}%({{ jt.total }}人)</div>
                  <div class="w-80px">{{ jt.passRate }}%</div>
                </li>
              </ul>
            </div>
          </div>
          <div class="h-50% flex flex-wrap">
            <div id="dw1" class="w-100% h-100%"></div>
          </div>
        </div>
        <div v-clickOutside="handleQutsides" class="w-100% h-25% p-10px">
          <div class="h-100% flex flex-wrap">
            <div class="w-100% h-33.333% flex flex-wrap">
              <div
                v-for="(item, index) in examOffList"
                :key="index"
                class="w-49% h-50%"
                :style="{ marginRight: index % 2 == 0 ? '1%' : '0' }"
              >
                <div class="sub-bg-title text-center font-size-18px p-4px">
                  {{ title[index] }}
                </div>
                <ul class="age-container" style="width: 100%" ref="ageRef">
                  <li class="title">
                    <div class="col-1">异地考生人数</div>
                    <div class="col-1">异地考生占比</div>
                  </li>
                  <li>
                    <div class="col-1">{{ item ? item.number : 0 }}人</div>
                    <div class="col-1">{{ item ? item.rate : 0 }}%</div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="w-100% h-66.666% flex flex-wrap">
              <div id="off" class="w-100% h-100%"></div>
            </div>
          </div>
        </div>
        <div v-clickOutside="handleQutsides" class="w-100% h-25% p-10px">
          <div class="h-66.666% flex flex-wrap">
            <div
              v-for="(item, index) in examCarList"
              :key="index"
              class="w-49% h-50%"
              :style="{ marginRight: index % 2 == 0 ? '1%' : '0' }"
            >
              <div class="sub-bg-title text-center font-size-18px p-4px">
                {{ title[index] }}
              </div>
              <ul class="age-container" style="width: 100%" ref="ageRef">
                <li class="title">
                  <div class="w-80px">车型</div>
                  <div class="col-1">预约人数及占比</div>
                  <div class="w-80px">合格率</div>
                </li>
                <li v-for="(jt, j) in item" :key="j">
                  <div class="w-80px">{{ jt.remark }}</div>
                  <div class="col-1">{{ jt.scale }}%({{ jt.total }}人)</div>
                  <div class="w-80px">{{ jt.passRate }}%</div>
                </li>
              </ul>
            </div>
          </div>
          <div class="h-33.333% flex flex-wrap">
            <div id="cx" class="w-100% h-100%"></div>
          </div>
        </div>
      </div>
      <div
        :class="{ 'right-active': transformActive }"
        class="w-23% h-100% position-relative z-100 st"
      >
        <!-- 车辆合格率排行 -->
        <!-- <div class="car-qualified h-40%">
          <div class="sub-title">
            车辆合格率排行
            <div>
              <p :class="[{ active: passStatus }]" @click="passStatus = true">
                科目二
              </p>
              <p :class="[{ active: !passStatus }]" @click="passStatus = false">
                科目三
              </p>
            </div>
          </div>
          <div class="pent">
            <div :style="transFormStyle(passStatus)" class="car-container">
              <ul v-if="carPassRate.km2.length" ref="carScrollRef">
                <li v-for="(item, index) in carPassRate.km2" :key="index">
                  <span class="xh">{{ index + 1 }}</span>
                  <span class="car-type">{{ item.kscx }}-{{ item.kcbh }}</span>
                  <span class="school">/{{ item.mc }} /</span>
                  <span class="num">{{ item.hgl }}<span>%</span></span>
                </li>
              </ul>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
              <ul v-if="carPassRate.km3.length" ref="carScrollRef1">
                <li v-for="(item, index) in carPassRate.km3" :key="index">
                  <span class="xh">{{ index + 1 }}</span>
                  <span class="car-type">{{ item.kscx }}-{{ item.kcbh }}</span>
                  <span class="school">/{{ item.mc }} /</span>
                  <span class="num">{{ item.hgl }}<span>%</span></span>
                </li>
              </ul>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
            </div>
          </div>
        </div> -->
        <!-- 考生情况统计分析 -->
        <div
          @mouseover="isMouseSitu = true"
          @mouseleave="isMouseSitu = false"
          class="car-qualified h-40%"
        >
          <div class="sub-title">
            <span @click="passStatus = -1">考生情况统计分析</span>

            <div>
              <p :class="[{ active: passStatus == 0 }]" @click="passStatus = 0">
                年龄
              </p>
              <p :class="[{ active: passStatus == 1 }]" @click="passStatus = 1">
                性别
              </p>
              <p :class="[{ active: passStatus == 2 }]" @click="passStatus = 2">
                异地
              </p>
              <p :class="[{ active: passStatus == 3 }]" @click="passStatus = 3">
                车型
              </p>
            </div>
          </div>
          <div class="pents">
            <div :style="transFormStyles(passStatus)" class="car-container">
              <ul v-if="examAgeData.length" class="age-container" ref="ageRef">
                <li class="title">
                  <div class="w-80px">年龄</div>
                  <div class="col-1">预约人数及占比</div>
                  <div class="w-80px">合格率</div>
                </li>
                <li v-for="(item, index) in examAgeData" :key="index">
                  <div class="w-80px">{{ item.remark }}</div>
                  <div class="col-1">
                    <el-progress
                      class="progress"
                      :stroke-width="8"
                      :percentage="item.scale"
                      color="#35b73d"
                    >
                      <p text></p>
                    </el-progress>
                    <div class="w-120px">
                      {{ item.scale }}%({{ item.total }}人)
                    </div>
                  </div>
                  <div class="w-80px">{{ item.passRate }}%</div>
                </li>
              </ul>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
              <ul
                v-if="examSexData.length"
                class="examinee-container"
                ref="examIneeRef"
              >
                <li class="title">
                  <div></div>
                  <div>人数占比</div>
                  <div>预约人数</div>
                  <div>合格率</div>
                </li>
                <li v-for="(item, index) in examSexData" :key="index">
                  <div>{{ item.remark }}性</div>
                  <div>
                    <el-progress
                      :width="60"
                      type="circle"
                      :stroke-width="6"
                      :percentage="item.scale"
                      color="#004fc4"
                    >
                      <p class="font-size-12px color-white" text>
                        {{ item.scale }}%
                      </p>
                    </el-progress>
                  </div>
                  <div>{{ item.total }}</div>
                  <div>{{ item.passRate }}%</div>
                </li>
              </ul>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
              <!-- 新需求增加俩个 -->
              <div class="location-container">
                <div class="s-title">
                  <div>异地考生人数:{{ examOffData.number || 0 }}人</div>
                  <div>异地考生人数占比:{{ examOffData.rate || 0 }}%</div>
                </div>
                <div class="echarts" ref="locationRef"></div>
              </div>
              <!-- <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div> -->

              <ul
                v-if="examCarData.length"
                class="cartype-container"
                ref="carRef"
              >
                <li class="title">
                  <div class="w-80px">车型</div>
                  <div class="col-1">预约人数及占比</div>
                  <div class="w-80px">合格率</div>
                </li>
                <li v-for="(item, index) in examCarData" :key="index">
                  <div class="w-80px">{{ item.remark }}</div>
                  <div class="col-1">
                    <el-progress
                      class="progress"
                      :stroke-width="8"
                      :percentage="item.scale"
                      color="#35b73d"
                    >
                      <p text></p>
                    </el-progress>
                    <div class="w-120px">
                      {{ item.scale }}%({{ item.total }}人)
                    </div>
                  </div>
                  <div class="w-80px">{{ item.passRate }}%</div>
                </li>
              </ul>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
            </div>
          </div>
        </div>
        <!-- 扣分分析 -->
        <div
          @mouseover="isMouseDed = true"
          @mouseleave="isMouseDed = false"
          class="deduct h-60%"
        >
          <div class="sub-title">
            扣分分析
            <div>
              <p
                :class="[{ active: deductStatus }]"
                @click="deductStatus = true"
              >
                科目二
              </p>
              <p
                :class="[{ active: !deductStatus }]"
                @click="deductStatus = false"
              >
                科目三
              </p>
            </div>
          </div>
          <div class="pent">
            <div class="deduct-container" :style="transFormStyle(deductStatus)">
              <div v-if="pointData.km2.length">
                <div ref="deductPie1Ref" class="h-25%"></div>
                <p class="sub2-title">科目二排行前十扣分项</p>
                <div class="table-container">
                  <table>
                    <tr>
                      <td class="dc1">序号</td>
                      <td class="dc2">扣分描述</td>
                      <td class="dc3">扣分分值</td>
                      <td class="dc4">扣分次数</td>
                    </tr>
                    <tr v-for="(item, index) in pointData.km2" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.mark }}</td>
                      <td>{{ item.frequency }}</td>
                    </tr>
                  </table>
                </div>
              </div>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
              <div v-if="pointData.km3.length">
                <div ref="deductPie2Ref" class="h-25%"></div>
                <p class="sub2-title">科目三排行前十扣分项</p>
                <div class="table-container">
                  <table>
                    <tr>
                      <td>序号</td>
                      <td>扣分描述</td>
                      <td>扣分分值</td>
                      <td>扣分次数</td>
                    </tr>
                    <tr v-for="(item, index) in pointData.km3" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.mark }}</td>
                      <td>{{ item.frequency }}</td>
                    </tr>
                  </table>
                </div>
              </div>
              <div v-else class="nodata">
                <img :src="nodata" alt="" />
                <p class="w-100% text-center">暂无相关数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 数据统计 -->
      <div
        :class="{ 'bottom-active': transformActive }"
        class="w-100% h-100% position-relative dataanalysis z-999"
      >
        <overseas-candidates
          :key="typeAnalysis"
          :type="typeAnalysis"
        ></overseas-candidates>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.bg {
  background-image: url("~/image/bg.jpg");
  background-size: 100% 100%;
}
.main {
  background-image: url("~/image/bg.jpg");
  // background: #022342;
  background-size: 100% 100%;
  box-sizing: border-box;
  padding: 0 20px 20px 20px;
  color: white;
  background-repeat: no-repeat;
  overflow: hidden;
  position: relative;
}

.loading {
  z-index: 1001;
  background: #000000c4;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  > div {
    width: 50%;
  }
  :deep(.el-progress__text) {
    color: white;
  }
}

.st {
  background: #0223422d;
}

.c {
  background-image: url("~/image/header.png");
  background-size: 100% 100%;
}
.top-analysis {
  width: 154px;
  height: 49px;
  line-height: 49px;
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  background-image: url("~/image/default-tab.png");
  background-size: 100% 100%;
  position: absolute;
  top: 8px;
  cursor: pointer;
}
.img-active {
  background-image: url("~/image/default-tab-s.png");
}

.nodata {
  width: 50%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.top-active {
  transform: translateY(-100%);
}

.content {
  height: 94%;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  flex-wrap: wrap;
  position: relative;
  .tap {
    width: 30px;
    height: 60px;
    position: absolute;
    bottom: 12%;
    cursor: pointer;
    z-index: 9;
    background-size: auto 100%;
    background-position-x: center;
    background-repeat: no-repeat;
  }
  .prev {
    background-image: url("~/image/prev.png");
  }
  .next {
    background-image: url("~/image/next.png");
  }
  .dataanalysis {
    height: 100%;
    position: absolute;
    left: 0;
    bottom: -100%;
  }
  .bottom-active {
    transform: translateY(-100%);
  }
  .left-active {
    transform: translateX(-100%);
  }
  .right-active {
    transform: translateX(100%);
  }
  > div {
    box-sizing: border-box;
    transition: transform 0.5s;
    .warn {
      height: calc(100% - 70px);
      margin-top: 20px;
      li {
        height: 33.333%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        > p {
          width: 65px;
          font-size: 14px;
        }
        .box {
          display: flex;
          align-items: center;
          flex: 1;
          height: 80%;
          border-radius: 2000px;
          background: linear-gradient(
            to right,
            rgba(6, 58, 81, 0.4),
            rgba(6, 59, 81, 0.87),
            rgba(6, 58, 81, 0.4)
          );
          margin: 0 15px;
          .txt {
            flex: 1;
            text-align: center;
          }
          .line {
            width: 1px;
            height: 60%;
            background: #3a6c78;
          }
          .leve1 {
            color: #ff373c;
          }
          .leve2 {
            color: #ff6c00;
          }
          .leve3 {
            color: #ffbf37;
          }
        }
        .echarts-t {
          height: 100%;
          aspect-ratio: 1;
        }
      }
    }
    .exam-room {
      height: calc(100% - 60px);
      margin-top: 10px;
      padding: 0 20px;
      // display: flex;
      // position: relative;
      ul {
        display: flex;
        width: 100%;
        height: 100%;
        li {
          flex: 1;
          position: relative;
          img {
            width: 100%;
            position: absolute;
            top: 0;
            bottom: 0;
            margin: auto;
          }
          .top {
            width: 100%;
            font-size: 28px;
            color: #02f4ff;
            position: absolute;
            text-align: center;
            top: 0;
          }
          .bot {
            width: 100%;
            font-size: 18px;
            color: #ffffff;
            position: absolute;
            bottom: 0;
            text-align: center;
          }
        }
      }
      &::after {
        content: "";
        width: 20px;
        height: 20px;
        position: absolute;
        top: 0;
        box-shadow: 0 0 100px rgba(240, 4, 4, 0.5);
      }
      .left {
        width: 30%;
        position: relative;
        &::after {
          content: "";
          position: absolute;
          width: 1px;
          height: 100%;
          right: 0;
          top: 0;
          background: linear-gradient(
            244deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.918) 50%,
            rgba(255, 255, 255, 0) 100%
          );
        }
      }
      .right {
        width: 70%;
        > div {
          padding-left: 25px;
          span {
            color: #02f4ff;
            font-weight: 700;
          }
        }
        .tsd {
          position: relative;
          &::after {
            content: "";
            position: absolute;
            width: 150%;
            height: 1px;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              244deg,
              rgba(255, 255, 255, 0) 0,
              rgba(255, 255, 255, 0.918) 50%,
              rgba(255, 255, 255, 0) 100%
            );
          }
        }
      }
      .left > div,
      .right > div {
        height: 33.333%;
        display: flex;
        align-items: center;
      }
    }

    .exam-progress {
      height: calc(100% - 60px);
      margin-top: 10px;
      padding: 0 20px;
      li {
        height: 25%;
        flex-direction: column;
        justify-content: space-around;
        .progress1 {
          display: block;
          :deep(.el-progress-bar__outer) {
            background: #04475d;
          }
        }
        .progress2 {
          display: block;
          :deep(.el-progress-bar__outer) {
            background: #384039;
          }
        }
        .progress3 {
          display: block;
          :deep(.el-progress-bar__outer) {
            background: #0d315e;
          }
        }
        .progress4 {
          display: block;
          :deep(.el-progress-bar__outer) {
            background: #35b73d2e;
          }
        }
      }
    }
    .qualified {
      height: calc(100% - 60px);
      margin-top: 10px;
    }

    .car-qualified .sub-title,
    .deduct .sub-title {
      display: flex;
      justify-content: space-between;
      > div {
        height: 30px;
        margin-top: 18px;
        line-height: 30px;
        .active {
          background: rgba(16, 101, 121, 1);
          color: white;
          &::after {
            content: "";
            top: -4px;
            left: 0;
            position: absolute;
            width: 100%;
            height: 2px;
            background: #30e9e3;
          }
        }
        p {
          height: 100%;
          font-size: 16px;
          text-align: center;
          display: inline-block;
          margin-right: 1px;
          cursor: pointer;
          position: relative;
          padding: 0 6px;
        }
      }
    }
    .car-qualified {
      .pent {
        width: 100%;
        height: calc(100% - 60px);
        overflow-x: hidden;
        .car-container {
          width: 200%;
          display: flex;
          height: 100%;
          transition: all 0.2s;
          ul {
            flex: 1;
            height: 100%;
            overflow-y: scroll;
            padding-bottom: 4px;
            li {
              display: flex;
              align-items: center;
              height: 40px;
              line-height: 40px;
              padding: 0 12px;
              cursor: pointer;
              transition: all 0.4s;
              position: relative;
              &:nth-child(odd) {
                background-color: #cccccc2f; /* 设置奇数行的背景色 */
              }
              &:hover {
                background: #02f2ff69;
              }
              > span {
                display: inline-block;
              }
              .xh {
                width: 30px;
                height: 20px;
                text-align: center;
                line-height: 20px;
                border: 1px solid white;
                border-radius: 6px;
                font-size: 12px;
              }
              .car-type {
                width: 70px;
                margin-left: 20px;
                font-size: 14px;
                font-weight: 700;
              }
              .school {
                font-size: 14px;
              }
              .num {
                width: 60px;
                height: 24px;
                border-radius: 0 5px 0 5px;
                display: inline-block;
                position: absolute;
                background: #424e59;
                line-height: 24px;
                text-align: center;
                right: 12px;
                font-size: 18px;
                color: #31e9e3;
                span {
                  font-size: 14px;
                }
              }
            }
          }
        }
      }
      .pents {
        width: 100%;
        height: calc(100% - 60px);
        overflow-x: hidden;
        margin-top: 10px;
        .car-container {
          width: 400%;
          display: flex;
          height: 100%;
          transition: all 0.2s;
        }
        .nodata {
          width: 25%;
          height: 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
      }
    }
    .pent {
      width: 100%;
      height: calc(100% - 60px);
      overflow-x: hidden;
      margin-top: 10px;
      .deduct-container {
        width: 200%;
        display: flex;
        height: 100%;
        transition: all 0.2s;
        > div {
          width: 50%;
          .sub2-title {
            height: 22px;
            line-height: 22px;
            font-size: 14px;
            color: #1dfbf8;
            padding-left: 12px;
            position: relative;
            &::after {
              content: "";
              position: absolute;
              width: 2px;
              height: 10px;
              background: #1dfbf8;
              left: 2px;
              top: 0;
              bottom: 0;
              margin: auto;
            }
          }
          .table-container {
            height: calc(75% - 22px);
            overflow-y: scroll;
            table {
              width: 100%;
              border-spacing: 0;
              border-collapse: collapse;
              tr {
                transition: all 1.2s;
                // border: 1px saddlebrown solid;
                td {
                  text-align: center;
                  padding: 8px 4px;
                  font-size: 12px;
                  background: #595a5a2d;
                  border: 2px solid rgba(3, 36, 66, 1);
                }
                td:nth-child(1) {
                  width: 36px;
                }
                td:nth-child(2) {
                  text-align: left;
                }
                td:nth-child(3),
                td:nth-child(4) {
                  width: 72px;
                }
                &:hover {
                  background-color: #02f2ff4f;
                }
              }
              tr:nth-child(1) {
                td {
                  background: #595a5a7e;
                }
              }
            }
          }
        }
      }
    }
  }
}
.sub-title {
  height: 50px;
  line-height: 60px;
  font-size: 20px;
  font-weight: 700;
  background-image: url("~/image/home_sub_t.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding-left: 30px;
  .more {
    float: right;
    margin-right: 12px;
    font-size: 14px;
    font-weight: 300;
    cursor: pointer;
  }
}

.subject-result {
  height: calc(100% - 50px);

  li {
    width: 100%;
    height: (20% - 1.6px);
    display: flex;
    text-align: center;
    margin-bottom: 2px;
    > div {
      margin-right: 2px;
    }
    & :last-child {
      margin-right: 0;
    }
    .col-2 {
      flex: 2;
    }
    .col-1 {
      flex: 1;
      height: 100%;
      background: #595a5a2d;
    }
    .col-1,
    .col-2 {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .title-sda {
    > div {
      background: #595a5a7e;
    }
  }
  & :last-child {
    margin-bottom: 0;
  }
}

.age-container,
.cartype-container {
  width: 25%;
  overflow-y: scroll;
  .title {
    height: 20px;
    display: flex;
    background: none !important;
    line-height: normal;
    div {
      background-color: #cccccc2f;
    }
  }
  li {
    width: 100%;
    display: flex;
    text-align: center;
    height: 40px;
    line-height: 40px;
    div {
      box-sizing: border-box;
      padding: 0 4px;
    }
    .col-1 {
      flex: 1;
      margin: 0 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      .progress {
        width: calc(100% - 120px);
        display: block;
      }
    }
    &:nth-child(odd) {
      background-color: #cccccc2f; /* 设置奇数行的背景色 */
    }
    &:hover {
      background: #02f2ff69;
    }
  }
}
.location-container {
  width: 25%;
  .s-title {
    height: 60px;
    display: flex;
    padding: 0 12px;
    div {
      flex: 1;
      text-align: center;
      line-height: 60px;
    }
  }
  .echarts {
    height: calc(100% - 60px);
  }
}
.examinee-container {
  width: 25%;
  .title {
    display: flex;
    background: none !important;
    line-height: normal;
    align-content: center;
  }
  li {
    display: flex;
    height: 30%;
    > div {
      width: 25%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.sidebar {
  width: 400px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  background-color: #000000e0;
  background-image: url("~/image/leftBg.jpg");
  background-size: 100% 100%;
  transition: all 0.2s;
  ::-webkit-scrollbar {
    display: unset;
    width: 8px;
    background: rgba(48, 47, 47, 0.589);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb {
    height: 8px;
    background: #02f2ff4f;
    border-radius: 4px;
  }
  > div {
    height: 100%;
    padding-top: 20px;
  }
  .title {
    width: 100%;
    height: 45px;
    line-height: 45px;
    text-align: center;
    background-image: url("~/image/titleBg.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position-x: center;
    font-size: 22px;
    position: relative;
  }
  .sideStatusBtn {
    margin: 12px 0;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 20px;
    li {
      width: 80px;
      text-align: center;
      font-size: 14px;
      padding: 2px 0;
      border: 1px white solid;
      border-radius: 8px;
      cursor: pointer;
    }
    .active {
      background: #02f4ff;
    }
  }
  .exam-room-list {
    height: calc(100% - 116px);
    overflow-y: scroll;
    li {
      padding: 0 14px;
      height: 50px;
      line-height: 50px;
      display: flex;
      cursor: pointer;
      &:nth-child(odd) {
        background-color: #cccccc2f; /* 设置奇数行的背景色 */
      }
      &:hover {
        background-color: #02f2ff4f;
      }
      .kc {
        flex: 1;
        margin: 0 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .status {
        float: right;
      }
    }
  }
  .warn-list {
    height: calc(100% - 116px);
    overflow-y: scroll;
    li {
      display: flex;
      padding: 0 14px;
      height: 40px;
      line-height: 40px;
      cursor: pointer;
      &:nth-child(even) {
        background-color: #cccccc2f; /* 设置奇数行的背景色 */
      }
      &:hover {
        background-color: #02f2ff4f;
      }
      &:first-child {
        font-size: 12px;
        background: none;
      }
      .xh {
        width: 40px;
      }
      .kc {
        width: 130px;
        margin-right: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .zb {
        flex: 1;
        > div {
          height: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
  }
  .subject-list {
    height: calc(100% - 116px);
    overflow-y: scroll;
    li {
      display: flex;
      padding: 0 14px;
      height: 40px;
      line-height: 40px;
      cursor: pointer;
      &:nth-child(even) {
        background-color: #cccccc2f; /* 设置奇数行的背景色 */
      }
      &:hover {
        background-color: #02f2ff4f;
      }
      &:first-child {
        font-size: 12px;
        background: none;
      }
      .xh {
        width: 40px;
      }
      .kc {
        width: 130px;
        margin-right: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .zb {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  }
}
.iframe {
  z-index: 9;
  transition: all 0.6s;
  .menu {
    position: absolute;
    width: 200px;
    left: 24.5%;
    top: 150px;
    z-index: 99;
    li {
      text-align: center;
      font-size: 14px;
      > div {
        margin-bottom: 12px;
        cursor: pointer;
      }
      .leve1 {
        height: 40px;
        line-height: 40px;
        background-image: url("~/image/home-wxz.png");
        background-size: 100% 100%;
      }
      .leve2 {
        height: 30px;
        line-height: 30px;
        background: #0c253b;
      }
      .activeleve1 {
        color: #00e5fa;
        background-image: url("~/image/home-xz.png");
      }
      .activeleve2 {
        color: #00e5fa;
      }
    }
  }
}
.sub-bg-title {
  background-image: url("~/image/home-wxz.png");
  background-size: 100% 100%;
  margin-top: 50px;
  margin-bottom: 8px;
}
.web-active {
  filter: blur(6px);
}
.trans {
  // transform: rotate3d(1, 1, 1, 120deg);
  transition: all 0.8s;
}
.trans-activ {
  transform: rotate3d(1, 1, 1, 0deg);
}
</style>
