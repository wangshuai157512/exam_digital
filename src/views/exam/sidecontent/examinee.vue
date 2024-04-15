<script setup>
import { onMounted, unref, watch, onUnmounted, computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import PageTransition from "./components/PageTransition.vue";
import { useBlackStatus } from "./hooks/useBlack";
import { useNodeScrollStyle } from "./hooks/useNode";
import { Search } from "@element-plus/icons-vue";
import { personList, personInfo, getCodePoint } from "@/api/index";
import { formatDiffDuration, formattedDate, toUnix } from "@/utils/day";
import { examStore } from "@/store/modules/exam";
import { useMessageChannel } from "@/hooks/useChannel";
import usePolling from "@/hooks/usePolling";
import { examReasons } from "@/dict/index";
import { sortBy } from "lodash-es";
import { playStore } from "@/store/modules/play";
import track from "~/image/track.png";
import track_ac from "~/image/track_ac.png";
import hg from "~/image/hg.png";
import bhg from "~/image/bhg.png";
import { modalStore } from "@/store/modules/modal";

const play = playStore();

const { webMessagePort, stringify } = useMessageChannel();

const exam = examStore();

const examRoomId = unref(computed(() => exam.getExamId));

const name = ref("");
const count = ref("");

const { trigger, getSideBack } = useBlackStatus();

// 给3d挂载根据code查询项目
onMounted(() => {
  window.getCodePoint = getCodePoint;
});

// 页面卸载时清除
onUnmounted(() => {
  window.getCodePoint = null;
});

// 状态
const statusMap = {
  "": { status: "全部", order: -5, number: 0 },
  0: { color: "#D4D4D4", status: "未报到", number: 0, order: -4 },
  1: { color: "#12D2EC", status: "已报到", number: 0, order: -3 },
  2: { color: "#D898FF", status: "已分配", number: 0, order: -2 },
  3: { color: "#65A3FF", status: "考试中", number: 0, order: -1 },
  4: { color: "#D4D4D4", status: "已结束", number: 0, order: 0 }
};

//获取状态样式
const getStatusStyle = function (status) {
  const { color } = statusMap[status];
  return {
    color,
    border: `1px solid ${color}`
  };
};

//获取状态class
const getStatusClass = function (status) {
  if (status == 3) return "statust-s1 statust";
  if (status == 2) return "statust-s2 statust";
  if (status == 1) return "statust-s3 statust";
  if (status == 4) return "statust-s4 statust";
  if (status == 5) return "statust-s5 statust";
  if (status == 6) return "statust-s6 statust";
  if (status == 0) return "statust-s7 statust";
};

//获取状态label
const getStatusLabel = function (status) {
  const label = [
    "未报到",
    "已报到",
    "已分配",
    "考试中",
    "已结束",
    "合格",
    "不合格"
  ];
  return label[status];
};

// 列表给节点添加高度
const examineeList = ref();
const examineeStyle = useNodeScrollStyle(examineeList);

// 详情给节点添加高度
// const content = ref();
// const style = useNodeScrollStyle(content);

const data = ref([]);

const getPersonList = async (fn) => {
  // 重置数量
  Object.keys(statusMap).forEach((key) => {
    statusMap[key].number = 0;
  });
  return new Promise(function (resolve, reject) {
    personList({ name: unref(name), examRoomId }).then((res) => {
      data.value = res;
      res.forEach((item) => {
        if (item.status === 4 || item.status === 5 || item.status === 6) {
          statusMap[4].number++;
        } else {
          statusMap[item.status].number++;
        }
      });
      statusMap[""].number = res.length;
      resolve(res);
      fn();
    });
  });
};

usePolling(getPersonList);

// 根据考试状态进行列表排序
const sortBase = {
  // 0 未报到 1 已报道 2 已分配 3 考试中 4 已结束 5 合格 6 不合格
  3: 0,
  2: 1,
  1: 2,
  4: 3,
  5: 4,
  6: 5,
  0: 6
};

// 根据sort字段排序(数字小的优先级高)
const sortList = (list) => {
  return sortBy(list, "sort");
};

const sortMap = (item) => {
  return {
    ...item,
    sort: sortBase[item.status]
  };
};

// 检索考生人员列表
const personData = computed(() => {
  return sortList(
    unref(data)
      .filter((item) => {
        return (
          (unref(count) === "" ||
            (unref(count) == 4 && [4, 5, 6].includes(item.status)) ||
            item.status == unref(count)) &&
          ((item.name && item.name.includes(unref(name))) ||
            item.idCard.includes(unref(name)))
        );
      })
      .map(sortMap)
  );
});

const km = unref(computed(() => exam.getExamKm));

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

//详情
let infoTimer;
const photo = ref(null);
const project = ref([]);
const detailsRefHeight = ref(0);
const pInfo = function (idCard, ksxh) {
  clearTimeout(infoTimer);
  personInfo({ examRoomId, name: idCard, ksxh }).then((res) => {
    if (res) {
      // if (res.status === 3 || res.status === 4) {
      detailsInfo.value = res;
      if (res.itemList) {
        project.value = res.itemList.map(projectMap);
      }
      // 获取图片
      if (res.photo) {
        photo.value = `data:image/png;base64,${res.photo}`;
      }
      // webMessagePort.postMessage();
      trigger();
      // } else {
      //   // ElMessage({
      //   //   message: "考生暂未考试",
      //   //   type: "warning"
      //   // });
      // }
    }
    // 计算详情页高度
    nextTick(() => {
      const padding = 20;
      const examHight = document.querySelector(".exam").offsetHeight;
      const infoHeight = document.querySelector("#info").offsetHeight;

      detailsRefHeight.value = examHight - (infoHeight + padding);
    });

    // 使项目流水滚到最底部
    nextTick(() => {
      const tds = document.querySelector(".tds");
      if (tds) {
        tds.scrollTop = tds.scrollHeight;
      }
    });

    if (res.status !== 4) {
      infoTimer = setTimeout(() => {
        pInfo(idCard, ksxh);
      }, 6000);
    }
  });
};

// 根据科目查看是否合格
const passStamp = function (info) {
  const { score, kskm } = info;
  if (kskm === "2") {
    return score >= 80 ? hg : bhg;
  }
  if (kskm === "3") {
    return score >= 90 ? hg : bhg;
  }
};

// 点击查看详情
const detailsInfo = ref(null);
const targetExaminee = function ({ ksxh, idCard }) {
  pInfo(idCard, ksxh);
};

// 时间截取方法
const timeSplit = function (time) {
  if (!time) {
    return "--";
  }
  return time.split(" ")[1];
};

const format = "HH:mm:ss";

const getTimeLong = function (startTime, endTime) {
  return formatDiffDuration(toUnix(startTime), toUnix(endTime), format);
};

const calcTime = function (startTime, endTime = Date.now()) {
  timeLong.value = getTimeLong(startTime, endTime);
};

// 计算时长
let time;
const timeLong = ref("--");
watch(
  () => detailsInfo.value,
  (val) => {
    if (val) {
      const { status, startTime, endTime } = unref(detailsInfo);
      // 考试中计算实时时长
      // const start = toUnix(startTime);
      clearInterval(time);
      if (status === 3) {
        time = setInterval(calcTime, 500, startTime);
      } else if (status === 4) {
        calcTime(startTime, toUnix(endTime));
      } else {
        timeLong.value = "--";
      }
    }
  }
);

// 清除定时器
onUnmounted(() => {
  clearInterval(time);
});

// 获取考试项目状态颜色
const projectClass = function (status) {
  let className;
  switch (status) {
    case "0":
      className = "tg";
      break;
    case "1":
      className = "kf";
      break;
    case "2":
      className = "wg";
      break;
    default:
      className = "dq";
      break;
  }
  return className;
};

// 合并考试扣分项目
const mergeDeduct = function (deduct) {
  const deductedList = [];
  if (deduct) {
    deduct.forEach((item) => {
      if (item.deductedList) {
        deductedList.push(...item.deductedList);
      }
    });
  }

  return deductedList;
};

// 轨迹回放列表
const trackPlayBack = function (info) {
  return [];

  const {
    startTime,
    endTime,
    itemList,
    channel,
    equipment,
    extensionPoint,
    ksxh
  } = info;

  // if (!channel) return []; // 没有车载视频

  const { tdh } = channel || { tdh: null };
  const { yhm, mm, wldz, dk } = equipment || {
    yhm: null,
    mm: null,
    wldz: null,
    dk: null
  };
  const trackList = [];

  (itemList || []).forEach((item) => {
    if (!item.deductedList) {
      trackList.push({
        ...item,
        itemName: `${item.itemName}   无扣分`
      });
    } else {
      trackList.push(item, ...item.deductedList);
    }
  });

  trackList.push({
    startTime,
    endTime,
    itemName: "完整轨迹"
  });

  trackList.push(...extensionPoint);

  return trackList.map((item) => {
    return {
      ...item,
      tdh,
      yhm,
      mm,
      wldz,
      dk,
      ksxh
    };
  });
};

// 获取时间戳
const getTimeStamp = function (date) {
  return new Date(date).getTime();
};

// 视频回放事件
const trackCount = ref(null);
const handleBackPlay = function (rows, index) {
  const format = "YYYYMMDDTHHmmss[Z]";
  const { tdh, yhm, mm, wldz, dk, startTime, endTime, ksxh } = rows;
  const utcStartTime = formattedDate(getTimeStamp(startTime), format);
  const utcEndTime = formattedDate(getTimeStamp(endTime), format);
  const tdhs = tdh - 32;
  if (startTime && endTime) {
    const backPlayUrl = `rtsp://${yhm}:${mm}@${wldz}:554/Streaming/Unicast/tracks/${tdhs}01?starttime=${utcStartTime}&endtime=${utcEndTime}`;
    // const backPlayUrl =
    //   "rtsp://admin:Admin12345@10.0.3.164:554/Streaming/Unicast/tracks/2701?starttime=20231202T123010Z&endtime=20231202T123520Z";
    trackCount.value = index;
    play.$patch({
      url: backPlayUrl,
      isBackPlay: true,
      key: Date.now(),
      ksxh,
      startTime,
      endTime
    });
    // 3d 传入3d回放视频参数
    const params = {
      type: "trackPlayback",
      examNo: ksxh,
      startTime,
      endTime,
      playState: true,
      isDrag: false // 是否拖动
    };
    webMessagePort.postMessage(stringify(params));
    console.log(
      `%cweb回放传入3d开始参数：${stringify(params)}`,
      "color: blue;"
    );
  } else {
    ElMessage({
      type: "warning",
      message: "暂无回放数据"
    });
  }
};

// 监听返回重置
watch(getSideBack, (v) => {
  if (!v) {
    photo.value = null;
    trackCount.value = null;
    detailsInfo.value = null;
    clearInterval(time);
    clearTimeout(infoTimer);
    timeLong.value = "--";
    // 重置状态
    play.$patch({
      url: null,
      isBackPlay: false
    });
    // 通知3d退出
    webMessagePort.postMessage(stringify({ type: "exitTrackPlayback" }));
  }
});

onUnmounted(() => {
  clearInterval(time);
  clearTimeout(infoTimer);
});

const modal = modalStore();
const { addModalSet, setModalParam } = modal;

// 监听3d消息
onMounted(() => {
  webMessagePort.onmessage = function (msg) {
    if (!msg.data.type) {
      const findData = data.value.find((item) => item.idCard === msg.data);
      if (findData) {
        const { ksxh, idCard } = findData;
        pInfo(idCard, ksxh);
      }
      console.log(`未查询到所传id:${msg.data}`);
    } else if (msg.data.type === "warn") {
      addModalSet(0);
      setModalParam(msg.data.data);
    }
  };
});
</script>
<template>
  <!-- 过渡动画 -->
  <page-transition>
    <!-- 列表 -->
    <div
      class="float-left w-50% box-border p-10px flex justify-between flex-wrap"
    >
      <div
        v-for="(item, index) in statusMap"
        @click="count = index"
        :key="index"
        :style="{ order: item.order }"
        :class="[{ active: count === index }]"
        class="menu-item w-30% h-30px cursor-pointer text-center color-white font-size-12px"
      >
        {{ item.status }} {{ item.number }}
      </div>
      <div class="w-100% m-t-15px m-b-5px">
        <el-input class="w-100%" v-model="name" placeholder="姓名/身份证号">
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>
      <ul class="title-o flex w-100% flex-justify-between m-t-15px">
        <li class="w-80px">考生姓名</li>
        <li class="w-60px">编号</li>
        <li class="w-60px">考生分数</li>
        <li class="w-60px">考试状态</li>
      </ul>
      <div
        :style="examineeStyle"
        ref="examineeList"
        class="container-list w-100%"
      >
        <div
          v-for="(item, index) in personData"
          :key="index"
          @click="targetExaminee(item)"
          class="car-list cursor-pointer color-white h-42px m-t-8px flex justify-between items-center box-border p-l-15px p-r-15px"
        >
          <!-- <div class="w-25px">{{ index + 1 }}</div> -->
          <div class="w-80px">{{ item.name }}</div>
          <div class="w-60px">{{ item.carTypeAndCarNum }}</div>
          <div class="w-60px text-center">
            {{ item.score == null ? "--" : item.score }}
          </div>
          <div :class="getStatusClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </div>
        </div>
      </div>
    </div>
    <!-- 详情 -->
    <div
      class="w-50% h-100% box-border pl-10px pt-10px pb-10px float-left position-relative"
    >
      <div v-if="detailsInfo" class="w-100%">
        <div id="info">
          <!-- 合格标记图片 -->
          <!-- <img
            v-if="detailsInfo.status == 5 || detailsInfo.status == 6"
            class="bj"
            :src="passStamp(detailsInfo)"
            alt=""
          /> -->
          <div class="b-b flex p-t-5px p-b-5px box-border items-center">
            <h2 class="color-white text-left flex-1">
              {{ detailsInfo.xm }} / {{ detailsInfo.xb == "1" ? "男" : "女" }}
              <!-- <span class="font-size-10px">{{
                detailsInfo.xb == "1" ? "男" : "女"
              }}</span> -->
            </h2>
            <div>
              <div class="status">
                {{ getStatusLabel(detailsInfo.status) }}
              </div>
            </div>
          </div>
          <!-- 考生人员信息 -->
          <div
            class="car-content m-t-12px flex h-135px color-white font-size-14px"
          >
            <div class="w-30% m-r-12px h-100% bg-gray">
              <img v-if="photo" class="w-100% h-100%" :src="photo" />
            </div>
            <div
              class="flex-1 flex flex-wrap justify-between position-relative"
            >
              <p class="w-100% font-size-16px"></p>
              <p class="w-100%">流水号：{{ detailsInfo.lsh }}</p>
              <p class="w-100%">身份证号：{{ detailsInfo.idCard }}</p>
              <p class="w-100%">
                考试科目：{{ detailsInfo.kskm == 2 ? "科目二" : "科目三" }}
              </p>
              <p class="w-100%">考试车型：{{ detailsInfo.kscx }}</p>
              <p class="w-100%">
                考试原因：{{ examReasons.getLabel(detailsInfo.remark) }}
              </p>
              <p class="w-100%">预约次数：{{ detailsInfo.yycs }}</p>
            </div>
          </div>
          <div class="p-t-6px p-b-6px color-white font-size-14px b-b">
            <div class="m-t-2px">所属驾校：{{ detailsInfo.schoolName }}</div>
          </div>
        </div>
        <!-- 未报到或已报道隐藏 -->
        <div :style="{ height: detailsRefHeight + 'px', overflow: 'scroll' }">
          <div v-if="detailsInfo.status != 0 && detailsInfo.status != 1">
            <div
              v-if="detailsInfo.status == 2 && detailsInfo.status == 3"
              class="achievement p-t-12px p-b-12px b-b"
            >
              <div class="font-size-18px p-r-6px inline-block color-white">
                考试成绩：{{ detailsInfo.score }}分
              </div>
              <!-- 成绩信息 -->
              <ul class="achievement-list">
                <li>
                  <p>开始时间：{{ timeSplit(detailsInfo.startTime) }}</p>
                  <div class="w-15px"></div>
                  <p>结束时间：{{ timeSplit(detailsInfo.endTime) }}</p>
                </li>
                <li>
                  <p>考车号牌：{{ detailsInfo.kchp }}</p>
                  <div class="w-15px"></div>
                  <p>考车编号：{{ detailsInfo.kcbh }}</p>
                </li>
                <li>
                  <p>考试时长：{{ timeLong }}</p>
                  <div class="w-15px"></div>
                  <p>考试次数：{{ detailsInfo.kscs }}</p>
                </li>
              </ul>
            </div>
            <!-- 考试完成信息 -->
            <div
              v-if="
                detailsInfo.status == 4 ||
                detailsInfo.status == 5 ||
                detailsInfo.status == 6
              "
            >
              <div
                v-for="(item, index) in detailsInfo.examFinishList"
                :key="index"
                class="achievement b-b p-t-12px p-b-12px"
              >
                <div class="font-size-18px p-r-6px inline-block color-white">
                  考试成绩：{{ item.score }}分
                </div>
                <!-- 成绩信息 -->
                <ul class="achievement-list pb-10px">
                  <li>
                    <p>开始时间：{{ timeSplit(item.startTime) }}</p>
                    <div class="w-15px"></div>
                    <p>结束时间：{{ timeSplit(item.endTime) }}</p>
                  </li>
                  <li>
                    <p>考车号牌：{{ item.kchp }}</p>
                    <div class="w-15px"></div>
                    <p>考车编号：{{ item.kcbh }}</p>
                  </li>
                  <li>
                    <p>
                      考试时长：{{ getTimeLong(item.startTime, item.endTime) }}
                    </p>
                    <div class="w-15px"></div>
                    <p>考试次数：{{ item.kscs }}</p>
                  </li>
                </ul>
                <!-- 扣分 -->
                <div
                  v-if="item.pointDTOS && item.pointDTOS.length"
                  class="mb-10px"
                >
                  <ul
                    class="w-100% box-border p-6px border-rd-6px border-solid border-1px border-color-white color-white font-size-14px"
                  >
                    <li
                      class="ml-4px mb-4px"
                      v-for="(jtem, j) in item.pointDTOS"
                      :key="j"
                    >
                      <p>
                        {{ timeSplit(jtem.startTime) }}
                        <span v-if="jtem.score">扣{{ jtem.score }}分</span>
                      </p>
                      <p>
                        {{ jtem.itemName }}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!-- 考试项目 -->
            <ul
              v-if="detailsInfo.status === 3 && detailsInfo.itemList"
              class="exam-project flex mt-10px mb-10px flex-wrap"
            >
              <li
                :class="projectClass(item.status)"
                v-for="(item, index) in project"
                :key="index"
              >
                {{ item.itemName }}
              </li>
            </ul>
            <!-- 结束考试展示轨迹回放标题 -->
            <!-- <div
              v-if="detailsInfo.status === 4"
              class="m-t-12px m-b-12px p-r-6px p-l-6px inline-block p-2px bg-#0dacb4 color-white"
            >
              轨迹回放
            </div> -->
            <!-- 考试中展示所有扣分项目 -->
            <div
              v-if="detailsInfo.status === 3"
              class="tds w-100% h-380px box-border p-6px border-rd-6px border-solid border-1px border-color-white color-white font-size-14px"
            >
              <div
                class="ml-4px mb-4px"
                v-for="(item, index) in detailsInfo.extensionPoint"
                :key="index"
              >
                <p>
                  {{ timeSplit(item.startTime) }}
                  <span v-if="item.score">扣{{ item.score }}分</span>
                </p>
                <p>
                  {{ item.itemName }}
                </p>
              </div>
            </div>
            <!-- 考试结束展示轨迹回放 -->
            <ul v-if="detailsInfo.status === 4" class="deduct-points">
              <li
                :class="{ active: trackCount === index }"
                @click="handleBackPlay(item, index)"
                class="pt-4px pb-4px position-relative"
                v-for="(item, index) in trackPlayBack(detailsInfo)"
                :key="index"
              >
                <p v-if="item.score">
                  {{ timeSplit(item.startTime) }} 扣{{ item.score }}分
                </p>
                <p class="w80d">{{ item.itemName }}</p>
                <img
                  class="w-20px h-20px position-absolute top-0 bottom-0 right-4px m-auto"
                  :src="trackCount === index ? track_ac : track"
                  alt=""
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </page-transition>
</template>
<style scoped lang="less">
:deep(.el-input__wrapper) {
  border-radius: 0;
  background-color: unset;
  box-shadow: 0 0 0 1px #09acb0 inset !important;
}

:deep(.el-input__inner::placeholder) {
  color: white;
}

.car-list {
  background: #0a65724f;
  &:hover {
    background: #00feed73;
  }
}

.title-o {
  color: white;
  box-sizing: border-box;
  padding: 4px 15px;
  background: #0a65724f;
}
.menu-item {
  background-image: url("~/image/car-tab-t.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-bottom: 4px;
  line-height: 30px;
  font-style: italic;
}

.menu-item:nth-child(n + 2) {
  margin-bottom: 0;
}
.active {
  background-image: url("~/image/car-tab-s.png");
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

.bj {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 110px;
  right: 0px;
  z-index: 99;
}
.status {
  padding: 2px 4px;
  width: 60px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background: #00a5bd;
  // border: 1px solid white;
}
.statust {
  width: 60px;
  text-align: left;
  font-size: 14px;
  position: relative;
  padding-left: 10px;
  &::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    top: 0;
    bottom: 0;
    margin: auto;
    left: -8px;
    z-index: 99;
    border-radius: 50%;
  }
}
.statust-s1 {
  color: #4caae9;
  &::after {
    background: #4caae9;
  }
}
.statust-s2 {
  color: #9f51cc;
  &::after {
    background: #9f51cc;
  }
}
.statust-s3 {
  color: #f9db4a;
  &::after {
    background: #f9db4a;
  }
}
.statust-s4 {
  color: #a4a4a4;
  &::after {
    background: #a4a4a4;
  }
}
.statust-s5 {
  color: #03d077;
  &::after {
    background: #03d077;
  }
}
.statust-s6 {
  color: #fc3e3e;
  &::after {
    background: #fc3e3e;
  }
}
.statust-s7 {
  color: #ffffff;
  &::after {
    background: #ffffff;
  }
}

:deep(.el-input-group__append) {
  border-radius: 0;
  background-color: unset;
  box-shadow: 0 1px 0 0 #09acb0 inset, 0 -1px 0 0 #09acb0 inset,
    -1px 0 0 0 #09acb0 inset !important;
  color: #09acb0;
}

.b-b {
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

.achievement-list {
  li {
    display: flex;
    padding: 4px 0;
    p {
      flex: 1;
      color: white;
    }
  }
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
.deduct-points {
  li {
    min-height: 55px;
    color: white;
    padding: 6px 0;
    border-bottom: 1px solid rgb(170, 169, 169);
    cursor: pointer;
    flex-wrap: wrap;
    align-items: center;
    p {
      width: 100%;
    }
    .w80d {
      width: calc(100% - 30px);
    }
    display: flex;
    &:hover {
      background: #ffffff21;
    }
  }
  .active {
    color: rgb(53, 217, 231);
    background: #ffffff48;
  }
}
</style>
