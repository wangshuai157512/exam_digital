<script setup>
import { onMounted, reactive, computed, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { modalStore } from "@/store/modules/modal";
import { getWarningPage, getWarningStatistic } from "@/api/index";
import { examStore } from "@/store/modules/exam";
import { getMonthDate } from "@/utils/day";
import nodata from "@/assets/image/nodata.png";

const exam = examStore();

const kcxh = unref(computed(() => exam.getExamId));
const modal = modalStore();
const { removeModalSet, addModalSet, setModalParam } = modal;
const handleClose = function () {
  removeModalSet(1);
};

const from = reactive({
  yjdj: "",
  zt: "",
  startDate: getMonthDate(0, "YYYY-MM-DD"),
  endDate: getMonthDate(0, "YYYY-MM-DD")
});

const date = ref([
  getMonthDate(0, "YYYY-MM-DD"),
  getMonthDate(0, "YYYY-MM-DD")
]);

// 日期发生变化时赋值
watch(date, (newVal, oldVal) => {
  if (newVal) {
    from.startDate = newVal[0];
    from.endDate = newVal[1];
  } else {
    from.startDate = from.endDate = "";
  }
});

const eds = ["车辆停考", "车型停考", "考场停考"];

const levelOptions = ref([
  { value: 1, label: "一级" },
  { value: 2, label: "二级" },
  { value: 3, label: "三级" }
]);

const statusOptions = ref([
  { value: 0, label: "未处置" },
  { value: 1, label: "已处置" }
]);

// 获取预警级别颜色
const levleNode = function (levle) {
  let node;
  switch (levle) {
    case 1:
      node = "<span style=color:rgb(255,0,0)>一级</span>";
      break;
    case 2:
      node = "<span style=color:rgb(240,150,9)>二级</span>";
      break;
    default:
      node = "<span style=color:rgb(222,222,0)>三级</span>";
      break;
  }
  return node;
};

// 获取处置状态
const disposeNode = function (dispose) {
  let node;
  switch (dispose) {
    case "0":
      node = "<span style=color:rgb(255,123,66)>未处置</span>";
      break;
    default:
      node = "<span style=color:rgb(64,255,118)>已处置</span>";
      break;
  }
  return node;
};

const result = reactive({
  total: 0,
  ycl: 0,
  wcl: 0,
  data: []
});

// 获取数据
const getData = function () {
  getWarningPage({ ...from, kcxh }).then((res) => {
    result.data = res.map((item) => {
      return {
        ...item,
        yjsj: item.yjsj.split(" ")[1]
      };
    });
  });
  getWarningStatistic({ ...from, kcxh }).then((res) => {
    const { dealNum, total, unDealNum } = res;

    result.total = total || 0;
    result.ycl = dealNum || 0;
    result.wcl = unDealNum || 0;
  });
};

const modalSet = computed(() => modal.getModalSet);

// 监听模态框取消后请求接口
watch(modalSet.value, getData);

onMounted(getData);

// 点击处理详情
const handleDetails = function (rows) {
  addModalSet(0);
  setModalParam(rows);
};
</script>
<template>
  <div class="container yj-right">
    <div class="title">
      <span class="yj font-size-24px">预警信息</span>
      <div>
        <span>共{{ result.total }}条预警信息</span>
        <span>已处理预警:{{ result.ycl }}个</span>
        <span>未处理预警:{{ result.wcl }}个</span>
      </div>
      <el-icon @click="handleClose" size="30" color="cyan"><Close /></el-icon>
    </div>
    <div class="m-t-12px m-b-12px">
      <el-select
        popper-class="warn-popper"
        class="w-120px m-r-12px asd"
        clearable
        v-model="from.yjdj"
        placeholder="预警级别"
      >
        <el-option
          v-for="item in levelOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        popper-class="warn-popper"
        class="w-120px m-r-12px"
        clearable
        v-model="from.zt"
        placeholder="状态"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-date-picker
        popper-class="warn-date-popper"
        value-format="YYYY-MM-DD"
        v-model="date"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
      <el-button
        style="width: 100px; float: right"
        @click="getData"
        type="primary"
        >检索</el-button
      >
    </div>
    <div class="warn-container">
      <ul v-if="result.data.length">
        <li
          @click="!item.clxx ? function () {} : handleDetails(item)"
          v-for="(item, index) in result.data"
          :key="index"
        >
          <p class="dsa">{{ index + 1 }}</p>
          <div>
            <p class="font-size-12px">
              {{ item.yjsj }}
              <span v-html="levleNode(item.yjsjdj)"></span>
              <span v-html="disposeNode(item.zt)"></span>
            </p>
            {{ item.yjjx }}：{{ item.yjxx }}
          </div>
          <div
            style="width: 80px"
            class="h-20px position-absolute top-0 bottom-0 right-0 m-auto"
            v-if="item.clxx"
          >
            {{ eds[item.clxx] }}
          </div>
          <el-button
            v-else
            @click="handleDetails(item)"
            class="w-100px position-absolute top-0 bottom-0 right-10px m-auto"
            type="primary"
            >处置预警</el-button
          >
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
</template>
<style scoped lang="less">
:deep(.el-input__wrapper) {
  border-radius: 0;
  background: none;
  border: 0;
  box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
  &:hover {
    box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
  }
}
:deep(.el-button) {
  border-radius: 0;
  background: #0099a0;
  border: none;
}
:deep(.el-select__popper.el-popper) {
  border: none;
  background: red;
}
:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
}
:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
}
:deep(.el-select-dropdown) {
  border-radius: 0;
}
:deep(.el-range-separator) {
  color: white;
}
:deep(.el-input__inner) {
  color: white;
}
:deep(.el-range-input) {
  color: white;
}
.dsa {
  width: 30px !important;
  height: 30px !important;
  line-height: 30px;
  text-align: center;
  background-image: url("~/image/xh.png");
  background-size: 100% 100%;
  margin-right: 20px;
  color: #04f3bf;
}
.container {
  width: 900px;
  height: 600px;
  aspect-ratio: 5/3.5;
  background-image: url("~/image/tcx.png");
  background-size: 100% 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  // box-shadow: 0 0 5px 0 white;
  box-sizing: border-box;
  padding: 40px 20px 20px 20px;
  color: white;

  .title {
    position: relative;
    margin-top: 20px;

    .yj {
      position: absolute;
      top: -40px;
    }
    > div {
      width: calc(100% - 32px);
      white-space: nowrap; /* 防止文字换行 */
      overflow: hidden; /* 隐藏溢出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
    }
    span {
      margin-right: 40px;
    }
    :deep(.el-icon) {
      position: absolute;
      top: -110px;
      bottom: 0;
      right: -20px;
      margin: auto;
      cursor: pointer;
    }
  }

  .warn-container {
    height: calc(100% - 86px);
    overflow-y: scroll;
    padding-right: 10px;
    &::-webkit-scrollbar {
      // position: relative;
      display: block;
      width: 4px; /* 设置滚动条宽度 */
      border-right: 1px solid #d9ffffad; /* 设置滚动条右侧边框 */
      box-shadow: inset 0 0 10px #d9ffffad; /* 设置滚动条内部阴影 */
      // margin-left: 12px;
    }

    // &::-webkit-scrollbar-track {
    //   // background-color: #f5f5f5; /* 设置背景色 */
    // }

    &::-webkit-scrollbar-thumb {
      position: absolute;
      width: 4px;
      background: #00fefe;
      border-radius: 1px; /* 设置滑块颜色 */
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgb(49, 255, 255); /* 当鼠标悬停在滑块上时的颜色 */
    }
    li {
      display: flex;
      padding: 12px;
      position: relative;
      margin-bottom: 5px;
      cursor: pointer;
      background: #03445d;
      &:hover {
        background: #02f0f43c;
      }
      > p {
        width: 30px;
      }
      div {
        width: calc(100% - 180px);
        > p {
          span {
            margin-left: 20px;
          }
        }
      }
    }
  }
}
</style>
