<script setup>
import { onMounted, computed, unref, watch, onUnmounted, reactive } from "vue";
import PageTransition from "./components/PageTransition.vue";
import { useBlackStatus } from "./hooks/useBlack";
import { useNodeScrollStyle } from "./hooks/useNode";
import { Search } from "@element-plus/icons-vue";
import { equipmentList } from "@/api/index";
import monitor_zc from "~/image/monitor_zc.png";
import monitor_yc from "~/image/monitor_yc.png";
import { examStore } from "@/store/modules/exam";
import { useMessageChannel } from "@/hooks/useChannel";
import RtcVideo from "@/components/RtcVideo/index.vue";
import { getWebRtcRtspUrl } from "@/config/webrtc/index";
import { modalStore } from "@/store/modules/modal";

const exam = examStore();

const { webMessagePort, stringify } = useMessageChannel();

const kcxh = unref(computed(() => exam.getExamId));

const name = ref("");
const count = ref("");

const { trigger, getSideBack } = useBlackStatus();

// 状态
const statusMap = {
  "": { status: "全部", order: -5, number: 0 },
  0: { color: "#FF7033", status: "故障", number: 0, order: -1 },
  1: { color: "#54FF84", status: "正常", number: 0, order: -2 }
};

//获取状态样式
const getStatusClass = function (status) {
  if (status == 0) return "status ztc";
  else return "status zt";
};

// 列表给节点添加高度
const monitorList = ref();
const monitorStyle = useNodeScrollStyle(monitorList);

// 详情给节点添加高度
const content = ref();
const style = useNodeScrollStyle(content);

const data = ref([]);
// 获取列表
const getEquipmentList = async () => {
  equipmentList({ kcxh }).then((res) => {
    if (res) {
      data.value = res;
      statusMap[""].number = res.length;
      res.forEach((item) => {
        statusMap[item.zt].number++;
      });
      // 初始化设备
      webMessagePort.postMessage(
        stringify({
          type: "main",
          category: "monitoringEquipment",
          data: res.map((item) => ({
            name: item.spmc,
            number: item.spxh,
            state: item.zt
          }))
        })
      );
    }
  });
};
// 检索列表数据
const monitorResultList = computed(() => {
  return unref(data).filter(
    (item) =>
      (unref(count) === "" || item.zt === unref(count)) &&
      item.spmc.includes(unref(name))
  );
});

let webRtcServer;
// 查看详情
const info = reactive({
  zt: "",
  spmc: ""
});
// 推流地址
const rtspUrl = ref("");
const handleDtails = function ({
  spmc,
  zt,
  dk,
  tdh,
  wldz,
  yhm,
  mm,
  spxh,
  sblx
}) {
  info.zt = zt == 0 ? "故障" : "正常";
  info.spmc = spmc;
  const url = getWebRtcRtspUrl({ tdh, wldz, yhm, mm }, sblx);
  if (url) {
    rtspUrl.value = url;
    console.log("视频地址", rtspUrl.value);
    if (webRtcServer) {
      webRtcServer.connect(rtspUrl.value);
    }
  } else {
    console.error("视频类型地址错误");
  }
  webMessagePort.postMessage(
    stringify({
      type: "examMonitor",
      number: spxh
    })
  );
  trigger();
};

// const getVideUrl = function (info) {
//   if (!info) return "";
//   if (info.spmc.startsWith("倒车")) {
//     return dk;
//   } else if (info.spmc.startsWith("曲线")) {
//     return qx;
//   } else {
//     return "";
//   }
// };

onMounted(getEquipmentList);

const modal = modalStore();
const { addModalSet, setModalParam } = modal;

// 监听3d消息
onMounted(() => {
  webMessagePort.onmessage = function (msg) {
    if (!msg.data.type) {
      const findData = unref(data).find((item) => item.spxh === msg.data);
      if (findData) {
        handleDtails(findData);
      }
      console.log(`未查询到所传id:${msg.data}`);
    } else if (msg.data.type === "warn") {
      addModalSet(0);
      setModalParam(msg.data.data);
    }
  };
});

// 创建webrtc
const creatdWebRtcServer = function (rtc) {
  webRtcServer = rtc;
  webRtcServer.connect(rtspUrl.value);
};

// 视频播放错误
const handleVideoError = function () {
  console.log("视频播放错误");
};
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
        <el-input class="w-100%" v-model="name" placeholder="设备名称">
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>
      <ul class="title-o flex w-100% flex-justify-between m-t-15px">
        <li class="w-40px">序号</li>
        <li class="w-160px">设备名称</li>
        <li class="w-60px">设备状态</li>
      </ul>
      <div
        :style="monitorStyle"
        ref="monitorList"
        class="container-list w-100%"
      >
        <div
          v-for="(item, index) in monitorResultList"
          :key="index"
          @click="handleDtails(item)"
          class="monitor-list cursor-pointer color-white h-42px m-t-8px flex justify-between items-center box-border p-l-15px p-r-15px"
        >
          <div class="w-40px">
            <span class="monitor-xh">{{ index + 1 }}</span>
          </div>
          <div class="w-160px">{{ item.spmc }}</div>
          <!-- <div class="font-size-12px">已预警:2次</div> -->
          <div :class="getStatusClass(item.zt)">
            {{ statusMap[item.zt].status }}
          </div>
        </div>
      </div>
    </div>
    <!-- 详情 -->
    <div
      class="w-50% h-100% box-border p-10px float-left position-relative color-white"
    >
      <div class="b-b flex p-t-5px p-b-5px box-border items-center">
        <h2 class="text-left flex-1">设备信息</h2>
      </div>
      <div class="p-t-12px p-b-12px font-size-14px">{{ info.spmc }}</div>
      <div class="flex items-center m-b-12px">
        <img
          class="w-40px h-40px m-r-12px"
          :src="info.zt === '正常' ? monitor_zc : monitor_yc"
          alt=""
        />
        <div>设备状态:{{ info.zt }}</div>
      </div>
      <!-- <div class="video"></div> -->
      <rtc-video
        v-if="getSideBack"
        class="video"
        @error="handleVideoError"
        @creatdWebRtcServer="creatdWebRtcServer"
      ></rtc-video>
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

.monitor-list {
  background: #0a65724f;
  &:hover {
    background: #00feed73;
  }
}
.status {
  width: 60px;
  text-align: center;
  &::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    top: 0;
    bottom: 0;
    margin: auto;
    left: 0px;
    z-index: 99;
    border-radius: 50%;
  }
}

.ztc {
  position: relative;
  color: #ff6969;
  font-size: 14px;
  &::after {
    background: #ff6969;
  }
}
.zt {
  color: #21df95;
  position: relative;
  font-size: 14px;
  &::after {
    background: #21df95;
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

.video {
  width: 100%;
  aspect-ratio: 4/3;
  background: black;
  // margin-top: 20px;
}

.menu-item {
  background-image: url("~/image/car-tab-t.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  line-height: 30px;
  font-style: italic;
}

.active {
  background-image: url("~/image/car-tab-s.png");
}

.title-o {
  color: white;
  box-sizing: border-box;
  padding: 4px 15px;
  background: #0a65724f;
}

.monitor-xh {
  width: 30px;
  height: 30px;
  display: block;
  background-image: url("~/image/xh.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  text-align: center;
  line-height: 30px;
}
</style>
