<script setup>
import { onBeforeMount, onMounted } from "vue";
import { getResultInfo } from "@/api/index";
import { examReasons } from "@/dict/index";
import { examStore } from "@/store/modules/exam";
import { playStore } from "@/store/modules/play";
import { useNodeScrollStyle } from "./hooks/useNode";
import { useMessageChannel } from "@/hooks/useChannel";
import { formatDiffDuration, formattedDate, toUnix } from "@/utils/day";
import qs from "qs";
import track from "~/image/track.png";
import track_ac from "~/image/track_ac.png";
import { getCodePoint } from "@/api/index";

const play = playStore();

const { webMessagePort, stringify } = useMessageChannel();

// 解析url参数
const params = qs.parse(location.href.split("?")[1]);
const exam = examStore();
const examKcdd = unref(computed(() => exam.getExamKcdd));
const examKm = unref(computed(() => exam.getExamKm));

// 列表给节点添加高度
const playList = ref();
const playStyle = useNodeScrollStyle(playList);

// 时间截取方法
const timeSplit = function (time) {
  if (!time) {
    return "--";
  }
  return time.split(" ")[1];
};

// 给3d传入初始化参数
onMounted(() => {});

// 获取时间戳
const getTimeStamp = function (date) {
  return new Date(date).getTime();
};

// 视频回放
const playback = (row) => {
  if (detailsInfo.value.channel && detailsInfo.value.equipment) {
    const format = "YYYYMMDDTHHmmss[Z]";
    const { tdh } = detailsInfo.value.channel;
    const { yhm, mm, wldz } = detailsInfo.value.equipment;
    const startTime = row.kssj || row.pointStartTime;
    const endTime = row.jssj || row.pointEndTime;
    const utcStartTime = formattedDate(getTimeStamp(startTime), format);
    const utcEndTime = formattedDate(getTimeStamp(endTime), format);
    const tdhs = tdh - 32;
    const backPlayUrl = `rtsp://${yhm}:${mm}@${wldz}:554/Streaming/Unicast/tracks/${tdhs}01?starttime=${utcStartTime}&endtime=${utcEndTime}`;
    play.$patch({
      url: backPlayUrl,
      isBackPlay: true,
      key: Date.now(),
      ksxh: params.examId,
      startTime,
      endTime
    });
  }
};

let currentProject;

const detailsInfo = ref(null);
const photo = ref(null);
const poroject = ref([]);
const activ = ref("");

// 给3d挂载根据code查询项目
onMounted(() => {
  window.getCodePoint = getCodePoint;
});

// 页面卸载时清除
onUnmounted(() => {
  window.getCodePoint = null;
});

onMounted(() => {
  getResultInfo(params.examId).then((res) => {
    if (res) {
      // 获取详情
      detailsInfo.value = res;

      // 获取图片
      if (res.reportPhoto || res.photo) {
        photo.value = `data:image/png;base64,${res.reportPhoto || res.photo}`;
      }

      const { itemList, startTIme, endTime } = res;

      // 处理项目列表
      const porojectList = [
        { name: "完整轨迹", kssj: startTIme, jssj: endTime, ksgcxh: 100 }
      ];
      for (let i = 1; i < itemList.length - 1; i++) {
        porojectList.push(itemList[i]);
      }
      poroject.value = porojectList;

      // 获取目标轨迹
      for (let i = 0; i < porojectList.length; i++) {
        if (params.current === porojectList[i].name + porojectList[i].ksgcxh) {
          currentProject = porojectList[i];
          break;
        }
        const { pointList } = porojectList[i];
        // 存在扣分项目
        if (pointList) {
          for (let j = 0; j < pointList.length; j++) {
            if (
              params.current ===
              pointList[j].pointReason + porojectList[i].ksgcxh
            ) {
              currentProject = {
                ...pointList[j],
                ksgcxh: porojectList[i].ksgcxh
              };
            }
            break;
          }
        }
      }

      console.log("currentProject", currentProject);
      // 选中激活的菜单
      activ.value =
        (currentProject.name || currentProject.pointReason) +
        currentProject.ksgcxh;

      // 等待3d模型加载完成
      window.loadSceneQueue.push(function (p) {
        if (p >= 100) {
          playback(currentProject);
        }
      });

      // 3d回放
      webMessagePort.postMessage(
        stringify({
          type: "inTrackPlayback",
          examAreaCode: `${examKcdd}-${examKm}`,
          examNo: params.examId,
          startTime: currentProject.kssj || currentProject.pointStartTime,
          endTime: currentProject.jssj || currentProject.pointEndTime,
          playState: true
        })
      );
    }
  });
});

// 点击轨迹回放
const handlePlay = function (row) {
  if ((row.kssj && row.jssj) || (row.pointStartTime && row.pointEndTime)) {
    activ.value = (row.name || row.pointReason) + row.ksgcxh;
    playback(row);
    webMessagePort.postMessage(
      stringify({
        type: "changeTrackPlayback",
        changeStatus: true,
        examNo: params.examId,
        startTime: row.kssj || row.pointStartTime,
        endTime: row.jssj || row.pointEndTime,
        playState: true
      })
    );
  }
};
</script>
<template>
  <div
    class="w-100% h-100% box-border pl-10px pt-10px pb-10px float-left position-relative"
  >
    <div v-if="detailsInfo" class="w-100%">
      <div id="info">
        <div class="b-b flex p-t-5px p-b-5px box-border items-center">
          <h2 class="color-white text-left flex-1">
            {{ detailsInfo.name }} / {{ detailsInfo.xb == "1" ? "男" : "女" }}
          </h2>
          <div>
            <div class="status color-white font-size-18px">
              {{ detailsInfo.mark }}分
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
          <div class="flex-1 flex flex-wrap justify-between position-relative">
            <p class="w-100% font-size-16px"></p>
            <p class="w-100%">流水号：{{ detailsInfo.id }}</p>
            <p class="w-100%">身份证号：{{ detailsInfo.cardCode }}</p>
            <p class="w-100%">
              考试科目：{{ detailsInfo.examSubject == 2 ? "科目二" : "科目三" }}
            </p>
            <p class="w-100%">考试车型：{{ detailsInfo.syzjcx }}</p>
            <p class="w-100%">
              考试原因：{{ examReasons.getLabel(detailsInfo.reason) }}
            </p>
            <!-- <p class="w-100%">预约次数：{{ detailsInfo.appointmentNo }}</p> -->
          </div>
        </div>
        <!-- <div class="p-t-6px p-b-6px color-white font-size-14px b-b">
          <div class="m-t-2px">所属驾校：{{ detailsInfo.schoolName }}</div>
        </div> -->
        <ul class="b-b">
          <li class="flex color-white font-size-14px p-t-6px p-b-6px">
            <div class="flex-1 margin-right:20px">
              考试成绩：{{ detailsInfo.mark }}分
            </div>
            <div class="flex-1">
              考试结果：{{ detailsInfo.hgbj === "1" ? "合格" : "不合格" }}
            </div>
          </li>
          <li class="flex color-white font-size-14px p-b-6px">
            <div class="flex-1 margin-right:20px">
              开始时间：{{ timeSplit(detailsInfo.startTIme) }}
            </div>
            <div class="flex-1">
              结束时间：{{ timeSplit(detailsInfo.endTime) }}
            </div>
          </li>
          <li class="flex color-white font-size-14px p-b-6px">
            <div class="flex-1 margin-right:20px">
              考试时长：{{ detailsInfo.examTime }}
            </div>
            <div class="flex-1">考试次数：{{ detailsInfo.examNo }}次</div>
          </li>
          <li class="flex color-white font-size-14px p-b-6px">
            <div class="flex-1 margin-right:20px">
              考试日期：{{ detailsInfo.examDate.split(" ")[0] }}
            </div>
            <div class="flex-1">
              预约次数：{{ detailsInfo.appointmentNo }}次
            </div>
          </li>
          <li class="flex color-white font-size-14px p-b-6px">
            <div class="flex-1 margin-right:20px">
              考车号牌：{{ detailsInfo.carCode }}
            </div>
            <div class="flex-1">考车编号：{{ detailsInfo.kcbh }}</div>
          </li>
        </ul>
      </div>
      <ul ref="playList" :style="playStyle" class="deduct-points">
        <li v-for="(item, index) in poroject" :key="index">
          <div
            :class="{ active: activ === item.name + item.ksgcxh }"
            class="pt-4px pb-4px position-relative flex flex-wrap"
            @click="handlePlay(item)"
          >
            <div class="flex-1">{{ item.name }}</div>
            <div v-if="item.kssj && item.jssj" class="flex-1 m-l-20px mr-20px">
              {{ timeSplit(item.kssj) }}-{{ timeSplit(item.jssj) }}
            </div>
            <img
              v-if="item.kssj && item.jssj"
              class="w-20px h-20px position-absolute top-0 bottom-0 right-4px m-auto"
              :src="activ === item.name + item.ksgcxh ? track_ac : track"
              alt=""
            />
          </div>
          <div
            class="w-100% position-relative"
            :class="{ active: activ === jtem.pointReason + item.ksgcxh }"
            v-for="(jtem, j) in item.pointList || []"
            @click="handlePlay({ ...jtem, ksgcxh: item.ksgcxh })"
            :key="j"
          >
            <div>{{ timeSplit(jtem.pointTime) }}扣{{ jtem.mark }}分</div>
            <div style="width: calc(100% - 30px)">
              {{ jtem.pointReason }}扣{{ jtem.mark }}分
            </div>
            <img
              v-if="jtem.pointStartTime && jtem.pointEndTime"
              class="w-20px h-20px position-absolute top-0 bottom-0 right-4px m-auto"
              :src="activ === jtem.pointReason + item.ksgcxh ? track_ac : track"
              alt=""
            />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped lang="less">
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
.deduct-points {
  li {
    background: #0a65724f;
    margin-top: 8px;
    > div {
      min-height: 45px;
      color: white;
      padding: 4px 0;
      // border-bottom: 1px solid rgb(170, 169, 169);
      cursor: pointer;
      flex-wrap: wrap;
      align-items: center;
      display: flex;
      p {
        width: 100%;
      }
      .w80d {
        width: calc(100% - 30px);
      }
      &:hover {
        background: #00feed73;
      }
      > div {
        height: 100%;
        box-sizing: border-box;
        padding-left: 8px;
      }
    }
  }
  .active {
    > div {
      color: rgb(53, 217, 231);
    }
    background: #ffffff48;
  }
}
</style>
