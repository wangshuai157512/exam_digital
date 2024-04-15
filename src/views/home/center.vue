<script setup>
import axios from "axios";
import * as echarts from "echarts";
import { onMounted, ref, unref, nextTick } from "vue";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useSocketCar } from "../exam/sidecontent/hooks/useSocketCar";
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
  getExamRoomWran
} from "@/api/index";
import { examStore } from "@/store/modules/exam";
import { useRouter } from "vue-router";
import { options, mapGetOptions } from "./index.js";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import zz from "@/assets/image/zz.png";
import wap from "@/assets/image/wap.png";
import tz from "@/assets/image/tz.png";
import zzWran from "@/assets/image/zz-wran.gif";
import wapWran from "@/assets/image/wap-wran.gif";
import tzWran from "@/assets/image/tz-wran.gif";

const emits = defineEmits(["indoorWebgl", "examRoomData"]);
// 地图所在区域码
const adCode = 130600;
const mapRef = ref();

// 实时协议查询车辆
const { examRoomOnlineNum } = useSocketCar();

const exam = examStore();

const examId = unref(computed(() => exam.getExamId));

const { push } = useRouter();

// 累计考试人数 累计考试人次
const examInees = reactive({
  examineesNum: 0,
  examinationAttendance: 0
});

onMounted(() => {
  getExamIneesNum().then(({ examineesNum, examinationAttendance }) => {
    examInees.examineesNum = examineesNum;
    examInees.examinationAttendance = examinationAttendance;
  });
});

/**地图 */
let map,
  wranTimer,
  mapCountTimer,
  isMapMounted = false;
const mapData = ref([]);
const mapCount = ref(0);
const warnMap = {};

// 处理有预警情况
const handleWarn = function (warnMapList) {
  // 拿预警队列中的第一个处理
  mapCount.value = Number(warnMapList[0]);
  // 视图更新后删除已预警的数据
  nextTick(() => {
    delete warnMap[unref(mapCount)];
  });
};

// 点击地图小标记进入考场主页
const handleMapClick = function (map) {
  const { examStatus, subject, examroomId, kcdddh } = map;
  // if (examStatus === "C") {
  //   return ElMessage({
  //     message: "此考场今日无考试安排",
  //     type: "warning"
  //   });
  // }
  exam.$patch({
    id: examroomId,
    kcdddm: kcdddh,
    km: subject
  });
  push("/exam");
};

// 加载考场3d缩略图
const thumJson = ref({});
axios.get("/map-3dthum/index.json").then((res) => {
  thumJson.value = res.data;
});

let isBack = false;

// 轮询地图点label hoverCount：触发hover时传入的count
const pollingMapCount = function (hoverCount = null) {
  let pollTime = 4000;
  isBack = false;
  // 清除上次任务定时
  clearTimeout(mapCountTimer);
  if (unref(mapData).length) {
    // 是否有预警
    const warnMapList = Object.keys(warnMap);
    if (warnMapList.length) {
      pollTime = 6000;
      handleWarn(warnMapList);
    } else {
      // 无预警情况
      if (hoverCount !== null) {
        mapCount.value = hoverCount;
      } else if (!isMouseMap && unref(mapCount) >= unref(mapData).length - 1) {
        mapCount.value = 0;
      } else if (!isMouseMap) {
        mapCount.value++;
      }
      const mapCountData = unref(mapData)[unref(mapCount)];

      // 一半时间展示3d
      const thum = unref(thumJson)[mapCountData.examroomId];

      // 是否存在场景
      if (thum) {
        nextTick(() => {
          // 更新翻转卡片动画
          let front;
          const back = document.querySelector(".back-3d");
          // 正在考试
          if (["A", "B"].includes(mapCountData.examStatus)) {
            front = document.querySelector(".zz-item");
          } else if (mapCountData.examStatus === "C") {
            // 未安排
            front = document.querySelector(".wap-item");
          }
          setTimeout(() => {
            isBack = true;
            back.innerHTML = `<img src="${thum}" alt="">`;
            front.style.transform = "rotateY(-180deg)";
            back.style.transform = "rotateY(0deg)";
          }, pollTime / 2);
        });
      }
    }
  }
  mapCountTimer = setTimeout(pollingMapCount, pollTime);
};

const handleTooltipClick = function (count) {
  const map = unref(mapData)[count];
  if (isBack) {
    emits("indoorWebgl", map);
  } else {
    handleMapClick(map);
  }
};

// 查找考场预警
const addExamRoomWran = function (data) {
  // 考场列表轮询时清除预警定时
  clearTimeout(wranTimer);
  // 查询考场序号列表
  const kcxhs = data.map((item) => item.examroomId);
  getExamRoomWran(kcxhs).then((res) => {
    let hasWran = false; // 是否有预警
    res.forEach((item) => {
      const index = kcxhs.indexOf(item.kcxh);
      //   const index = Math.ceil(Math.random() * kcxhs.length) - 1;
      if (index > -1) {
        hasWran = true;
        warnMap[index] = res[0]; // res[0];
      }
    });
    // 预警队列
    const warnMapList = Object.keys(warnMap);
    // 如果当前没有预警 直接处理预警任务
    if (hasWran && !warnMapList.length) {
      pollingMapCount();
    }
    // 定时轮询查询预警 10s轮询查看
    wranTimer = setTimeout(() => {
      addExamRoomWran(data);
    }, 10000);
  });
};

//考场信息
const examRoomData = ref([]);
let examRoomMax = 100; // 宽度计算
// 考场信息
const handleExamRoomInfo = function () {
  getExamRoomInfo().then((res) => {
    const data = res.filter((item) => item.appointNum > 0);
    examRoomMax = Math.max(...data.map((item) => item.appointNum));
    examRoomData.value = data.map((item) => {
      return {
        ...item,
        passRate: item.passRate > 100 ? 100 : item.passRate,
        rate: Math.floor((item.examinedNum / item.appointNum) * 100) || 0
      };
    });
    emits("examRoomData", res);
    if (isMapMounted) {
      mapData.value = addMapPixel(filterMapData(res));
    } else {
      renderMapMount((mapData.value = addMapPixel(filterMapData(res))));
    }
    isMapMounted = true;
    // 隔30s查询考场信息
    setTimeout(handleExamRoomInfo, 30000);
  });
};

onMounted(() => {
  map = echarts.init(unref(mapRef));
  // 地图考场信息配置项
  mapGetOptions(echarts, adCode).then(() => {
    map.setOption(options, true);
    handleExamRoomInfo();
  });
});

// 给icon 添加像素坐标
const addMapPixel = function (data) {
  return data.map((item) => {
    return {
      ...item,
      pixel: convertToPixel(Number(item.longitude), Number(item.latitude))
    };
  });
};

// 过滤有经纬度的数据
const filterMapData = function (data) {
  return data.filter((item) => item.latitude && item.longitude);
};

const renderMapMount = function (res) {
  nextTick(() => {
    pollingMapCount();
    addExamRoomWran(res);
  });
};

// 清除定时器
onUnmounted(() => {
  clearTimeout(wranTimer);
  clearTimeout(mapCountTimer);
  // clearInterval(timer);
});

// 根据地图坐标计算屏幕位置
const convertToPixel = function (longitude, latitude) {
  return map.convertToPixel("geo", [longitude, latitude]);
};

const tooltip = ref();
// 弹框位置
const mapTooltipStyle = function (currentCount) {
  if (unref(tooltip)) {
    const hasWarn = unref(warnMap)[currentCount];
    const { examStatus } = unref(mapData)[currentCount];
    const tooltipWidth = 225; // 弹框宽度
    const tooltipHeight = hasWarn // 弹框高度
      ? 190
      : examStatus === "A" || examStatus === "B"
      ? 145
      : 105;
    const mapRect = unref(mapRef).getBoundingClientRect();
    const [left, top] = unref(mapData)[currentCount].pixel;
    const targetGap = 10; // 提示框相距目标坐标距离

    let targetLeft, targetTop;
    // 判断是否超出地图
    if (left + tooltipWidth + targetGap > mapRect.width) {
      targetLeft = left - tooltipWidth - targetGap;
    } else {
      targetLeft = left + targetGap;
    }

    if (top + tooltipHeight + targetGap > mapRect.height) {
      targetTop = top - tooltipHeight - targetGap;
    } else {
      targetTop = top + targetGap;
    }

    return {
      left: `${targetLeft}px`,
      top: `${targetTop}px`
    };
  }

  return null;
};

// 根据状态创建不同信息提示框
const creatTooltip = function (currentCount) {
  const hasWarn = unref(warnMap)[currentCount];
  const {
    examroomName,
    examStatus,
    subject,
    examinedNum,
    unExaminedNum,
    passRate
  } = unref(mapData)[currentCount];
  const subjectLabel = subject == 2 ? "科目二" : "科目三";
  const examStatusLabel =
    examStatus == "A"
      ? "正在考试"
      : examStatus == "B"
      ? "停止考试"
      : "暂未安排考试";

  if (hasWarn) {
    const { yjjx, yjsjdj, yjsj } = hasWarn;
    const time = yjsj.split(" ")[1];
    const level = ["", "一级", "二级", "三级"][yjsjdj];
    const classLevel = ["", "dj1", "dj2", "dj3"][yjsjdj];

    return `<div class="tooltip-warn">
              <div class="top">
                <div>
                  <span class="time">${time}</span>
                  <span class="dj ${classLevel}">${level}</span>
                </div>
                <div class="info">${yjjx}</div>
              </div>
              <div class="bottom">
                <div class="name">${examroomName}</div>
                <div class="ti">考试科目：${subjectLabel}</div>
                <div class="ti">已考/未考：${examinedNum}/${unExaminedNum}</div>
                <div class="ti">当前合格率：${passRate}%</div>
                <div class="ti">考场状态：${examStatusLabel}</div>
              </div>
            </div>`;
  } else if (examStatus === "A" || examStatus === "B") {
    return `<div class="tooltip-zz">
              <div class="zz-item">
                <div class="name">${examroomName}</div>
                <div class="ti">考试科目：${subjectLabel}</div>
                <div class="ti">已考/未考：${examinedNum}/${unExaminedNum}</div>
                <div class="ti">当前合格率：${passRate}%</div>
                <div class="ti">考场状态：${examStatusLabel}</div>
              </div>
              <div class="back-3d"></div>
          </div>`;
  } else {
    return `<div class="tooltip-wap">
              <div class="wap-item">
                <div class="name">${examroomName}</div>
                <div class="ti">考试科目：${subjectLabel}</div>
                <div class="ti">考场状态：${examStatusLabel}</div>
              </div>
              <div class="back-3d"></div>
          </div>`;
  }
};

// 鼠标移入时显示提示框
let isMouseMap = false;
const showTooltip = function (hoverCount) {
  isMouseMap = true;
  pollingMapCount(hoverCount);
};

// 鼠标离开
const handleMouseLeave = function () {
  isMouseMap = false;
};

// 点击考场信息
const enterExamRoom = function (row) {
  const { examStatus, subject, examroomId, kcdddh } = row;

  // if (examStatus === "C") {
  //   return ElMessage({
  //     message: "此考场今日无考试安排",
  //     type: "warning"
  //   });
  // }
  exam.$patch({
    id: examroomId,
    kcdddm: kcdddh,
    km: subject
  });
  push("/exam");
};

// 获取地图icon图标
const getMapIcon = function (item, index) {
  // 当前有预警
  const count = mapCount.value;
  if (warnMap[index] && count === index) {
    if (item.examStatus === "A") {
      return zzWran;
    } else if (item.examStatus === "B") {
      return tzWran;
    } else {
      return wapWran;
    }
  } else if (item.examStatus === "A") {
    // 正常
    return zz;
  } else if (item.examStatus === "B") {
    // 暂停
    return tz;
  } else {
    return wap; // 未安排
  }
};

const downStatus = ref(false);
const isMouseRoom = { value: false };
// 考场信息滚动
const examInfoRef = ref();
onMounted(() => {
  useAutoScroll(unref(examInfoRef), 5000, isMouseRoom);
});

//计算宽度
const calcProgressStyle = function (n, t) {
  const l = n / t;
  return { width: `calc(${(n / t) * 100}% + ${(1 - l) * 80}px)` };
};

//地图下滑动画 与上面联动
const transFormMapStyle = computed(() => {
  return { transform: `translateY(${unref(downStatus) ? "30%" : 0})` };
});

// 考场信息框动画
const transFormDwonStyle = computed(() => {
  return { transform: `translateY(${unref(downStatus) ? "200%" : 0})` };
});

// 考场信息标题动画
const transFormUpStyle = computed(() => {
  return { transform: `translateY(${unref(downStatus) ? "-16px" : "80px"})` };
});
</script>
<template>
  <div class="w-100% h-100%">
    <!-- 滚动动画 -->
    <div class="num-count">
      <div>
        <p>今年累计考试人数</p>
        <roll-number :count="examInees.examineesNum" :numLength="6" />
      </div>
      <div>
        <p>今年累计考试人次</p>
        <roll-number :count="examInees.examinationAttendance" :numLength="8" />
      </div>
    </div>

    <!-- 地图 -->
    <div :style="transFormMapStyle" class="map-container w-100% h-65%">
      <div ref="mapRef" class="map w-100% h-100%"></div>
      <!-- 根据图标宽高计算正确的像素位置修改图标宽高时同步修改left top 相减的值这样坐标点更加精确-->
      <img
        v-for="(item, index) in mapData"
        :style="{
          left: `${item.pixel[0] - 10}px`,
          top: `${item.pixel[1] - 13}px`
        }"
        :class="{ 'map-icon-active': mapCount === index }"
        @mouseover="showTooltip(index)"
        @mouseleave="handleMouseLeave"
        @click="handleMapClick(mapData[mapCount])"
        :src="getMapIcon(item, index)"
        :key="index"
        height="26"
        class="map-icon"
      />
      <div
        v-if="mapData.length"
        v-html="creatTooltip(mapCount)"
        @mouseover="isMouseMap = true"
        @mouseleave="isMouseMap = false"
        @click="handleTooltipClick(mapCount)"
        :style="mapTooltipStyle(mapCount)"
        ref="tooltip"
        class="tooltip-container"
      ></div>
      <div class="position-absolute bottom-2px left-2px z-99">
        <p><img width="20" :src="zz" alt="" />正在考试的考场</p>
        <p><img width="20" :src="tz" alt="" />停止考试的考场</p>
        <p><img width="20" :src="wap" alt="" />未安排考试的考场</p>
      </div>
    </div>
    <!-- 考场信息 -->
    <div
      @mouseover="isMouseRoom.value = true"
      @mouseleave="isMouseRoom.value = false"
      :style="transFormDwonStyle"
      class="exam-room-info h-35%"
    >
      <div class="header">
        <p @click="downStatus = true">
          考场信息
          <el-icon class="m-l-4px" size="24"><ArrowDown /></el-icon>
        </p>
      </div>
      <div class="center">
        <div class="title">
          <div>考试名称 ･ 科目 ･ 考试进度（已考人数 / 考生总数）</div>
          <div>合格率</div>
          <div>在线车辆</div>
        </div>
        <ul ref="examInfoRef">
          <li
            @click="enterExamRoom(item)"
            v-for="(item, index) in examRoomData"
            :key="index"
          >
            <div>
              <p class="m-title">{{ item.examroomName }}</p>
              <el-progress
                :style="calcProgressStyle(item.appointNum, examRoomMax)"
                :stroke-width="10"
                :percentage="item.rate"
                color="#02f4ff"
              >
                <p class="font-size-12px text-left color-white w-80px" text>
                  {{ item.examinedNum }}人/{{ item.appointNum }}人
                </p>
              </el-progress>
            </div>
            <div>
              <el-progress
                :width="40"
                type="circle"
                :stroke-width="4"
                :percentage="item.passRate"
                color="#004fc4"
              >
                <p class="w-40px font-size-12px color-white" text>
                  {{ item.passRate }}%
                </p>
              </el-progress>
            </div>
            <div>{{ examRoomOnlineNum[item.kcdddh] || 0 }}辆</div>
          </li>
        </ul>
      </div>
      <div class="footer"></div>
    </div>
    <!-- 考场信息上拉显示框 -->
    <div :style="transFormUpStyle" class="up">
      <p @click="downStatus = false">
        考场信息
        <el-icon class="m-l-4px" size="24"><ArrowUp /></el-icon>
      </p>
    </div>
  </div>
</template>
<style scoped lang="less">
.num-count {
  width: 80%;
  top: 1%;
  left: 0;
  right: 0;
  margin: auto;
  position: absolute;
  z-index: 99;
  display: flex;
  justify-content: space-around;
  div {
    p {
      text-align: center;
      margin-bottom: 2px;
    }
  }
}
.map-container {
  transition: all 0.5s;
  .tooltip-container {
    position: absolute;
    transition: all 0.5s;
    cursor: pointer;
    z-index: 11;
    :deep(.tooltip-wap) {
      width: 225px;
      height: 105px;
      position: relative;
      perspective: 1000px; /* 设置3D视角 */
      .wap-item {
        width: 100%;
        height: 100%;
        position: absolute;
        background-image: url("~/image/tooltip.png");
        background-size: 100% 100%;
        box-sizing: border-box;
        padding: 10px;
        backface-visibility: hidden; /* 背面在翻转时不可见 */
        transition: transform 0.6s; /* 设置翻转动画的时长 */
        .name {
          color: #01e8f8;
          font-size: 16px;
          margin-top: 4px;
          margin-bottom: 8px;
        }
        .ti {
          color: #01e8f8;
          font-size: 12px;
          margin-bottom: 4px;
        }
      }
      .back-3d {
        position: absolute;
        top: 0;
        width: 100%;
        height: 145px;
        backface-visibility: hidden; /* 背面在翻转时不可见 */
        transition: transform 0.6s; /* 设置翻转动画的时长 */
        transform: rotateY(180deg); /* 默认状态是背面朝上 */
        border-radius: 4px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    :deep(.tooltip-zz) {
      width: 225px;
      height: 145px;
      position: relative;
      perspective: 1000px; /* 设置3D视角 */
      .zz-item {
        width: 100%;
        height: 100%;
        position: absolute;
        background-image: url("~/image/tooltip.png");
        background-size: 100% 100%;
        box-sizing: border-box;
        padding: 10px;
        backface-visibility: hidden; /* 背面在翻转时不可见 */
        transition: transform 0.6s; /* 设置翻转动画的时长 */
        .name {
          color: #01e8f8;
          font-size: 16px;
          margin-top: 4px;
          margin-bottom: 8px;
        }
        .ti {
          color: #01e8f8;
          font-size: 12px;
          margin-bottom: 4px;
        }
      }
      .back-3d {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden; /* 背面在翻转时不可见 */
        transition: transform 0.6s; /* 设置翻转动画的时长 */
        transform: rotateY(180deg); /* 默认状态是背面朝上 */
        border-radius: 4px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    :deep(.tooltip-warn) {
      width: 225px;
      height: 190px;
      bottom: 190px;
      background-image: url("~/image/wran_room_info.png");
      background-size: 100% 100%;
      .top {
        height: 54px;
        box-sizing: border-box;
        padding: 6px 10px;
        .time {
          font-size: 12px;
          margin-right: 10px;
        }
        .dj {
          font-size: 10px;
          padding: 0 4px;
          border-radius: 2px;
          color: black;
        }
        .dj1 {
          background: #ff0000;
        }
        .dj2 {
          background: #f09609;
        }
        .dj3 {
          background: #dede00;
        }
        .info {
          font-size: 14px;
        }
      }
      .bottom {
        box-sizing: border-box;
        padding: 10px;
        .name {
          color: #01e8f8;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .ti {
          color: #01e8f8;
          font-size: 12px;
          margin-bottom: 4px;
        }
      }
    }
  }
  .map-icon {
    position: absolute;
    cursor: pointer;
    z-index: 9;
  }
  .map-icon-active {
    z-index: 10;
    animation: bounce 0.5s linear infinite;
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  p {
    margin-top: 6px;
    img {
      margin-right: 6px;
    }
  }
}
.map {
  position: absolute;
  top: 0;
  left: 0;
}
.exam-room-info {
  width: 86%;
  margin: auto;
  transition: all 0.3s;
  > div {
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .header {
    height: 12%;
    background-image: url("~/image/exam-room-header.png");
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    p {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }
  .center {
    height: 76%;
    background-image: url("~/image/exam-room-center.png");
    padding-top: 20px;
    .title {
      width: 70%;
      display: flex;
      margin: auto;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      background: rgba(255, 255, 255, 0.144);
      > div:nth-child(1) {
        flex: 1;
        padding-left: 8px;
      }
      > div:nth-child(2),
      > div:nth-child(3) {
        width: 80px;
        text-align: center;
        align-items: center;
      }
    }
    ul {
      width: 70%;
      height: calc(100% - 30px);
      margin: auto;
      overflow-y: scroll;
      li {
        padding: 5px 0;
        display: flex;
        cursor: pointer;
        &:hover {
          background: #02f2ff1a;
        }
        > div {
          padding: 0 6px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          .m-title {
            width: 100%;
            font-size: 12px;
          }
          :deep(.el-progress-bar__outer) {
            background: #02f2ff2a;
          }
          :deep(.el-progress-circle__track) {
            stroke: #85abe5;
          }
        }
        > div:nth-child(1) {
          flex: 1;
        }
        > div:nth-child(2),
        > div:nth-child(3) {
          width: 80px;
          text-align: center;
          align-items: center;
        }
      }
    }
  }
  .footer {
    height: 12%;
    background-image: url("~/image/exam-room-footer.png");
  }
}
.up {
  width: 60%;
  height: 60px;
  background-image: url("~/image/up.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: absolute;
  left: 0;
  right: 0;
  bottom: -20px;
  margin: auto;
  text-align: center;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  font-size: 20px;
  transition: all 0.4s;
  p {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}
</style>
