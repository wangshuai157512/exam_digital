<script setup>
import { Close } from "@element-plus/icons-vue";
import { modalStore } from "@/store/modules/modal";
import { onMounted, reactive } from "vue";
import { getWarningInfo, warningProcess, warningReport } from "@/api/index";
import novideo from "@/assets/image/novideo.png";
import wranVideo from "@/assets/video/wran.mp4";

const modal = modalStore();
const { removeModalSet, getModalParam, setModalParam } = modal;

const radio = ref("");

const textarea = ref("");
const eds = ["车辆停考", "车型停考", "考场停考"];

const levelOptions = function (v) {
  switch (v) {
    case 1:
      return "一级";
    case 2:
      return "二级";
    default:
      return "三级";
  }
};

// 预警详情
const info = reactive({
  yjjx: "",
  yjxx: "",
  yjsjdj: "",
  yjdj: "",
  warningSbList: [],
  time: "",
  clxx: "",
  bz: "",
  czr: "",
  czsj: "",
  tpdz: null
});

const warningInfo = function () {
  const { id } = getModalParam;
  getWarningInfo({ id }).then((res) => {
    if (res) {
      info.yjjx = res.yjjx;
      info.yjxx = res.yjxx;
      info.yjsjdj = levelOptions(res.yjsjdj);
      info.yjdj = levelOptions(res.yjdj);
      info.warningSbList = res.warningSbList;
      info.time = res.yjsj.split(" ")[1];
      info.clxx = res.clxx;
      info.bz = res.bz;
      info.czr = res.clr;
      info.czsj = (res.clsj && res.clsj.split(" ")[1]) || "";
      info.tpdz = res.tpdz;
    }
  });
};

onMounted(() => {
  warningInfo();
});

watch(radio, (v) => {
  if (v) {
    isReport.value = false;
  }
});

const isReport = ref(false);

// 上报
const handleWarningReport = function () {
  radio.value = "";
  isReport.value = true;
};

// 预警处理
const handleWarningProcess = function () {
  if (isReport.value) {
    if (!textarea.value) {
      ElMessage({
        message: "请输入备注信息",
        type: "warning"
      });
      return;
    }
  } else {
    if (!radio.value) {
      ElMessage({
        message: "请输入处理方式",
        type: "warning"
      });
      return;
    }
  }
  ElMessageBox.confirm("确定要提交吗?", "", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(() => {
      if (isReport.value) {
        warningReport({ id: getModalParam.id, sbrBz: textarea.value }).then(
          (res) => {
            ElMessage({
              message: "上报成功",
              type: "success"
            });
            warningInfo();
            isReport.value = false;
            textarea.value = "";
          }
        );
        return;
      }
      warningProcess({
        id: getModalParam.id,
        clxx: eds.indexOf(radio.value),
        bz: textarea.value
      }).then((res) => {
        ElMessage({
          message: "提交成功",
          type: "success"
        });
        warningInfo();
      });
    })
    .catch(() => {});
};
</script>
<template>
  <div class="container-details">
    <div class="title">
      <p class="before"></p>
      <p class="t">预警详情</p>
      <p class="affter"></p>
      <el-icon @click="removeModalSet(0)" size="32" color="cyan"
        ><Close
      /></el-icon>
    </div>
    <div class="content">
      <div class="video-container">
        <img
          v-if="info.tpdz"
          style="width: 100%; height: 100%"
          :src="info.tpdz"
          alt=""
        />
        <!-- <video class="w-100% h-100%" autoplay :src="wranVideo"></video> -->
        <!-- <div>
          <img :src="novideo" alt="" />
          <p class="color-white text-center mt-10px font-size-16px">暂无视频</p>
        </div> -->
      </div>
      <div class="text-container">
        <h2>{{ info.yjjx }}</h2>
        <div class="mt-10px mb-10px">{{ info.yjxx }}</div>
        <div class="sub-title">
          <span class="font-size-14px">{{ info.time }}</span>
          <!-- <span class="s">{{ info.yjdj }}</span> -->
          <span class="t">{{ info.yjsjdj }}</span>
          <span v-if="!info.clxx" class="t">未处置</span>
        </div>
        <div v-for="(item, index) in info.warningSbList" :key="index" class="m">
          {{ item.sbsj.split(" ")[1] }} {{ item.sbr }} {{ item.sbrBz }}
        </div>
        <div v-if="!info.clxx">
          <div class="m-t-12px">
            <p>请选择处置方式</p>
            <div class="flex items-center m-t-4px">
              <el-radio-group fill="#0054d7" v-model="radio">
                <el-radio-button label="车辆停考" />
                <el-radio-button label="车型停考" />
                <el-radio-button label="考场停考" />
              </el-radio-group>
              <el-button
                @click="handleWarningReport"
                class="m-l-30px"
                :class="[{ active: isReport }]"
                color="white"
                >我要上报</el-button
              >
            </div>
          </div>
          <div class="m-t-30px">
            <p>请输入备注信息</p>
            <el-input
              class="m-t-4px color-#ffff"
              v-model="textarea"
              :rows="6"
              type="textarea"
              placeholder="备注信息"
            />
          </div>
          <el-button
            @click="handleWarningProcess"
            class="m-t-30px easef"
            color="#169bd5"
            >提交</el-button
          >
        </div>
        <ul v-else>
          <li class="mt-15px">
            <p class="font-size-16px">处置结果</p>
            <p class="font-size-22px">{{ eds[info.clxx] }}</p>
          </li>
          <li class="mt-15px">
            <p class="font-size-16px">备注信息</p>
            <p class="font-size-22px">{{ info.bz }}</p>
          </li>
          <li class="mt-15px">
            <p class="font-size-16px">处置信息</p>
            <p class="font-size-22px">{{ info.czr }}</p>
          </li>
          <li class="mt-15px">
            <p class="font-size-16px">处置时间</p>
            <p class="font-size-22px">{{ info.czsj }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.container-details {
  position: absolute;
  width: 1500px;
  height: 800px;
  background-image: url("~/image/tcd.png");
  background-size: 100% 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  box-sizing: border-box;
  z-index: 1001;
  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 0;
    border-right: none !important;
  }
  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 0;
    border-left: none !important;
  }
  :deep(.el-radio-button__inner) {
    background: #005169;
    color: white;
    border: 1px solid #008893;
  }
  :deep(.el-button) {
    border-radius: 0;
  }
  :deep(.el-radio-group .is-active .el-radio-button__inner) {
    border: 1px solid #008893;
    background: #005169 !important;
    box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
  }
  :deep(.el-button) {
    color: white;
    border: none;
    background: #005169;
    border: 1px solid #008893;
  }
  .easef {
    background-image: url("~/image/button-bg.png");
    background-size: 100% 100%;
    border: none !important;
  }

  :deep(.el-message-box) {
    background: red;
  }
  .title {
    box-sizing: border-box;
    color: white;
    height: 60px;
    font-size: 24px;
    line-height: 60px;
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 20px;
    .t {
      margin: 0 14px;
    }

    :deep(.el-icon) {
      position: absolute;
      top: -20px;
      bottom: 0;
      right: 0;
      margin: auto;
      cursor: pointer;
    }
  }
  .content {
    height: calc(100% - 100px);
    margin-top: 40px;
    padding: 0 20px;
    box-sizing: border-box;
    // display: flex;
    > div {
      float: left;
    }
    .video-container {
      width: 60%;
      aspect-ratio: 4/3;
      background: black;
      margin-right: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 120px;
      }
    }
    .text-container {
      width: calc(40% - 80px);
      color: white;
      .sub-title {
        padding-bottom: 10px;
        position: relative;
        &::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0px;
          background: linear-gradient(
            244deg,
            rgba(255, 255, 255, 0) 0,
            rgb(0, 246, 255) 50%,
            rgba(255, 255, 255, 0) 100%
          );
        }
        span {
          margin-right: 8px;
        }
        .t {
          font-size: 14px;
          padding: 2px 4px;
          border-radius: 2px;
          color: red;
        }
        .s {
          font-size: 14px;
          padding: 2px 4px;
          border-radius: 2px;
          color: red;
        }
      }
      .m {
        height: 50px;
        line-height: 50px;
        border-bottom: 5px #26435f solid;
        &:first-child {
          border-top: 5px #26435f solid;
        }
      }
    }
    :deep(.el-textarea__inner) {
      border-radius: 6px;
      background: #003351;
      box-shadow: 0 0 0 1px var(#435c74, #435c74) inset;
      color: white;
    }
    :deep(.el-button) {
      width: 120px;
    }
    .active {
      background: #005169 !important;
      box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
    }
  }
}
</style>
