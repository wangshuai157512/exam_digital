<script setup>
import { Close } from "@element-plus/icons-vue";
import { modalStore } from "@/store/modules/modal";
import { getResultInfo, getExamPhoto } from "@/api/index";
import { examStore } from "@/store/modules/exam";
import { getMonthDate } from "@/utils/day";
import { examReasons } from "@/dict/index";
import gj from "@/assets/image/gj.png";
import ks from "@/assets/image/ks.png";
import { onMounted, nextTick } from "vue";

const modal = modalStore();
const { getModalParam, removeModalSet } = modal;

const exam = examStore();
const examId = unref(computed(() => exam.getExamId));

const details = ref({});
const bmzp = ref(null);
const mjzp = ref(null);
const ksgcxhs = ref([]);
const zpIndex = ref(null);

onMounted(() => {
  getResultInfo(getModalParam.examId).then((res) => {
    if (res) {
      details.value = res;
      if (res.reportPhoto) {
        bmzp.value = `data:image/png;base64,${res.reportPhoto}`;
      }
      if (res.photo) {
        mjzp.value = `data:image/png;base64,${res.photo}`;
      }
      if (res.itemList) {
        ksgcxhs.value = res.itemList.map((item) => ({
          value: item.ksgcxh,
          name: item.name
        }));
      }
    }
  });
});

const imgSrc = ref(null);

watch(zpIndex, (val) => {
  getExamPhoto(ksgcxhs.value[val].value).then((res) => {
    if (res) {
      imgSrc.value = `data:image/png;base64,${res.zp}`;
    } else {
      imgSrc.value = null;
    }
  });
});

const viewImge = function (row, index, flg) {
  visble.value = true;
  zpIndex.value = index;
  if (!flg) return;
  // 修改滚动条位置
  nextTick(() => {
    const view = document.querySelector("#imgView");
    const img = document.querySelector(`#img${index}`);
    const viewTop = view.getBoundingClientRect().top;
    const imgTop = img.getBoundingClientRect().top;
    view.scrollTop = imgTop - viewTop;
  });
};

const viewAllImage = function () {
  zpIndex.value = 0;
  visble.value = true;
};

// 时间截取方法
const timeSplit = function (time, i) {
  if (!time) {
    return "";
  }
  return time.split(" ")[i];
};

const visble = ref(false);

const playVideo = function (row) {
  const width = screen.availWidth;
  const height = screen.availHeight;

  window.open(
    `/exam?trackPlayback=1&examId=${getModalParam.examId}&current=${
      (row.name || row.pointReason) + (row.ksgcxh || "")
    }`,
    "_blank",
    "width=" + width + ", height=" + height
  );
};
</script>
<template>
  <div class="containers">
    <div class="title">
      <div class="sub-title">考试明细</div>
      <el-icon @click="removeModalSet(4)" size="36" color="cyan"
        ><Close
      /></el-icon>
    </div>
    <div class="data-container">
      <div v-if="visble" class="ksjt-t">
        <div class="ksjt">
          <div class="title">
            <div class="sub-title">考试截图</div>
            <el-icon @click="visble = false" size="26" color="cyan"
              ><Close
            /></el-icon>
          </div>
          <div class="content">
            <div id="imgView" class="left">
              <div
                :id="`img${index}`"
                :class="[{ active: zpIndex === index }]"
                @click="viewImge(item, index)"
                v-for="(item, index) in ksgcxhs"
                v-show="item.name != '通用评判'"
                :key="index"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="right">
              <img style="width: 100%" v-if="imgSrc" :src="imgSrc" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div class="left">
        <div class="pot-container">
          <div style="margin-right: 30px">
            <div class="img">
              <img v-if="bmzp" class="w-100% h-100%" :src="bmzp" />
            </div>
            <div class="txt">报名照片</div>
          </div>
          <div>
            <div class="img">
              <img v-if="mjzp" class="w-100% h-100%" :src="mjzp" />
            </div>
            <div class="txt">门禁照片</div>
          </div>
        </div>
        <ul class="color-white info">
          <li>姓名：{{ details.name }}</li>
          <li>性别：{{ details.sex === "1" ? "男" : "女" }}</li>
          <li>流水号：{{ details.id }}</li>
          <li>身份证号：{{ details.cardCode }}</li>
          <li>驾校名称：{{ details.schoolName }}</li>
          <li>管理部门：{{ details.department }}</li>
          <li>发证机关：{{ details.authority }}</li>
        </ul>
        <img
          class="simg"
          @click="playVideo({ name: '完整轨迹', ksgcxh: 100 })"
          :src="gj"
          alt=""
        />
        <img class="simg" @click="viewAllImage" :src="ks" alt="" />
      </div>
      <div class="right">
        <ul>
          <li>
            <div>
              考试科目：{{ details.examSubject === "2" ? "科目二" : "科目三" }}
            </div>
            <div>考试成绩：{{ details.mark }}分</div>
            <div>考试时长：{{ details.examTime }}</div>
          </li>
          <li>
            <div>考试车型：{{ details.syzjcx }}</div>
            <div>考试结果：{{ details.hgbj === "1" ? "合格" : "不合格" }}</div>
            <div>车牌号码：{{ details.carCode }}</div>
          </li>
          <li>
            <div>考试原因：{{ examReasons.getLabel(details.reason) }}</div>
            <div>考试次数：{{ details.examNo }}</div>
            <div>考车编号：{{ details.kcbh }}</div>
          </li>
          <li>
            <div>预约次数：{{ details.appointmentNo }}</div>
            <div>开始时间：{{ timeSplit(details.startTIme, 1) }}</div>
            <div>考试员1：{{ details.ksy1 }}</div>
          </li>
          <li>
            <div>考试日期：{{ timeSplit(details.examDate, 0) }}</div>
            <div>结束时间：{{ timeSplit(details.endTime, 1) }}</div>
            <div>考试员2：{{ details.ksy2 }}</div>
          </li>
        </ul>
        <div class="table-data">
          <ul class="nav">
            <li class="w-46px">序号</li>
            <li class="flex-1">项目</li>
            <li class="flex-1">开始时间</li>
            <li class="flex-1">结束时间</li>
            <li class="text-center flex-1">考试截图</li>
            <li class="text-center flex-1">考试轨迹</li>
          </ul>
          <div v-if="details.itemList">
            <div
              v-for="(item, index) in details.itemList"
              :key="index"
              class="msd"
            >
              <div class="w-46px text-center">{{ index + 1 }}</div>
              <div class="flex-1">{{ item.name }}</div>
              <div class="flex-1">
                {{ timeSplit(item.kssj, 1) }}
              </div>
              <div class="flex-1">
                {{ timeSplit(item.jssj, 1) }}
              </div>
              <div class="text-center flex-1">
                <i class="el-icon-picture-outline"></i>
                <span
                  v-if="item.name != '通用评判'"
                  @click="viewImge(item, index, true)"
                  class="cursor-pointer"
                  >查看</span
                >
              </div>
              <div class="text-center flex-1">
                <span
                  v-if="
                    item.name != '通用评判' &&
                    index !== 0 &&
                    index !== details.itemList.length - 1
                  "
                  class="cursor-pointer"
                  @click="playVideo(item)"
                  >回放</span
                >
              </div>
              <div
                v-for="(jtem, jndex) in item.pointList"
                :key="jndex"
                class="tt"
              >
                <div class="w-46px"></div>
                <div style="width: calc((100% - 46px) * 0.8)">
                  {{ jtem.pointTime.split(" ")[1] }}
                  <span style="margin: 0 20px">扣{{ jtem.mark }}分</span>
                  {{ jtem.pointReason }}
                </div>
                <div class="text-center" style="width: calc((100% - 46px) / 5)">
                  <i class="el-icon-delete"></i>
                  <span
                    class="cursor-pointer"
                    @click="playVideo({ ...jtem, ksgcxh: item.ksgcxh })"
                    >回放</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.containers {
  width: 90%;
  height: 96%;
  background-image: url("~/image/tcx.png");
  background-size: 100% 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  padding-top: 20px;
  z-index: 1000;
  .ksjt-t {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.719);
    .ksjt {
      position: absolute;
      width: 600px;
      height: 450px;
      z-index: 1001;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      background-image: url("~/image/tcx.png");
      background-size: 100% 100%;
      .title {
        display: flex;
        position: relative;
        .sub-title {
          color: white;
          margin-left: 20px;
          font-size: 16px;
          margin-top: 8px;
        }
        :deep(.el-icon) {
          position: absolute;
          top: -10px;
          bottom: 0;
          right: 0;
          margin: auto;
          cursor: pointer;
        }
      }
      .content {
        display: flex;
        width: 100%;
        height: 390px;
        margin-top: 28px;
        padding: 0 12px;
        .left {
          width: 180px;
          height: calc(100% - 10px);
          padding-right: 10px;
          overflow-y: scroll;
          &::-webkit-scrollbar {
            // position: relative;
            display: block;
            width: 2px; /* 设置滚动条宽度 */
            border-right: 1px solid #d9ffffad; /* 设置滚动条右侧边框 */
            box-shadow: inset 0 0 10px #d9ffffad; /* 设置滚动条内部阴影 */
            // margin-left: 12px;
          }

          // &::-webkit-scrollbar-track {
          //   // background-color: #f5f5f5; /* 设置背景色 */
          // }

          &::-webkit-scrollbar-thumb {
            position: absolute;
            width: 2px;
            background: #00fefe;
            border-radius: 1px; /* 设置滑块颜色 */
          }

          &::-webkit-scrollbar-thumb:hover {
            background: rgb(49, 255, 255); /* 当鼠标悬停在滑块上时的颜色 */
          }
          > div {
            height: 32px;
            background-image: url("~/image/wxzd.png");
            background-size: 100% 100%;
            padding: 0 20px;
            line-height: 32px;
            color: white;
            cursor: pointer;
            margin-bottom: 20px;
          }
          > .active {
            color: #00e5fa;
            background-image: url("~/image/xzd.png");
          }
        }
        .right {
          flex: 1;
        }
      }
    }
  }

  .title {
    display: flex;
    position: relative;
    .sub-title {
      color: white;
      margin-left: 40px;
      font-size: 28px;
    }
    :deep(.el-icon) {
      position: absolute;
      top: -30px;
      bottom: 0;
      right: 0;
      margin: auto;
      cursor: pointer;
    }
  }
  .data-container {
    width: 100%;
    height: calc(100% - 52px);
    padding: 10px 20px;
    display: flex;
    .left {
      width: 300px;
      margin-right: 30px;
    }
    .right {
      width: calc(100% - 350px);
      height: 100%;
      overflow-y: scroll;
      > ul {
        height: 100px;
        display: flex;
        li {
          color: white;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      }
      .table-data {
        height: calc(100% - 120px);
        margin-top: 20px;
        .nav {
          display: flex;
          color: white;
          li {
            min-height: 40px;
            margin: 0 1px;
            background: #004d74;
            padding: 10px 6px;
          }
        }
        .msd {
          display: flex;
          color: white;
          background-color: #003351;
          color: white;
          flex-wrap: wrap;
          > div {
            min-height: 40px;
            margin: 0 1px;
            background: rgb(0, 58, 88);
            padding: 10px 6px;
          }
          .tt {
            width: 100% !important;
            flex: auto;
            padding: 0;
            div {
              float: left;
              min-height: 40px;
              padding: 10px 6px;
            }
          }
          &:nth-child(odd) {
            > div {
              background-color: #ffffff1c;
            }
          }
        }
      }
    }
    .pot-container {
      display: flex;
      height: 200px;
      margin-bottom: 20px;
      div {
        flex: 1;
        // display: flex;
        .img {
          height: 180px;
          background: #23465b;
        }
        .txt {
          text-align: center;
          color: white;
        }
      }
    }
    .info {
      li {
        margin-top: 12px;
      }
    }
    .simg {
      margin-top: 20px;
      cursor: pointer;
    }
  }
}
</style>
