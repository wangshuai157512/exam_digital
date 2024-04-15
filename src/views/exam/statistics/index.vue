<script setup>
import { Close } from "@element-plus/icons-vue";
import { modalStore } from "@/store/modules/modal";
import { getComponents } from "./components";
import {
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
  watchPostEffect
} from "vue";

const modal = modalStore();
const { removeModalSet } = modal;

const count = ref(0);

// watchPostEffect(() => {
//   console.log(count.value);
//   const p = document.querySelector(".el-pagination");
//   p.style.setProperty("--el-pagination-button-bg-color", "#797979");
// });

onMounted(() => {
  // 修改css变量
  const r = document.querySelector(":root");
  r.style.setProperty("--el-border-color-lighter", "#ffffff1f");

  const r1 = document.querySelector(".el-table");
  r1.style.setProperty("--el-table-border", "1px solid #003351");
});

onBeforeUnmount(() => {});
</script>
<template>
  <div class="layout">
    <el-icon @click="removeModalSet(2)" size="32"><Close /></el-icon>
    <div class="side-menu">
      <div class="top-title">数据分析</div>
      <div class="sub-title dd">
        <div></div>
        合格率分析
        <!-- <span class="font-size-24px color-#24d6ab">%</span> -->
      </div>
      <ul class="menu-container">
        <li :class="[{ active: count === 0 }]" @click="count = 0" class="dd">
          考场合格率
          <div></div>
        </li>
        <li :class="[{ active: count === 1 }]" @click="count = 1" class="dd">
          驾校合格率
          <div></div>
        </li>
        <li :class="[{ active: count === 2 }]" @click="count = 2" class="dd">
          考车合格率
          <div></div>
        </li>
        <li :class="[{ active: count === 3 }]" @click="count = 3" class="dd">
          考试项目合格率
          <div></div>
        </li>
        <li :class="[{ active: count === 4 }]" @click="count = 4" class="dd">
          考试员合格率
          <div></div>
        </li>
      </ul>
      <div class="sub-title dd">
        <div></div>
        扣分分析
        <!-- <span class="font-size-24px color-#24d6ab">扣</span> -->
      </div>
      <ul class="menu-container">
        <li :class="[{ active: count === 5 }]" @click="count = 5" class="dd">
          扣分项分析
          <div></div>
        </li>
        <li :class="[{ active: count === 6 }]" @click="count = 6" class="dd">
          考试员扣分分析
          <div></div>
        </li>
        <li :class="[{ active: count === 7 }]" @click="count = 7" class="dd">
          人工评判分析
          <div></div>
        </li>
      </ul>
      <!-- <div class="sub-title dd">
        <div></div>
        考试结果明细 <span class="font-size-24px color-#24d6ab">扣</span>
      </div>
      <ul class="menu-container">
        <li
          :class="[{ 'dd-activ': count === 8 }]"
          @click="count = 8"
          class="dd"
        >
          考试结果明细统计
          <div></div>
        </li>
      </ul> -->
    </div>
    <div class="content">
      <component :is="getComponents(count)" />
    </div>
  </div>
</template>
<style scoped lang="less">
.layout {
  width: 90%;
  height: 96%;
  color: white;
  background-image: url("~/image/tcx.png");
  background-size: 100% 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  display: flex;
  > :deep(.el-icon) {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
  }
  :deep(.el-form-item__label) {
    color: white;
  }
  .side-menu {
    width: 260px;
    height: 100%;
    // background: #0e3d68fe;
    box-sizing: border-box;
    padding: 15px 30px;
    .top-title {
      font-size: 22px;
      padding-left: 50px;
    }
    .sub-title {
      margin-top: 30px;
      margin-bottom: 10px;
      font-size: 20px;
      padding-left: 50px;
      position: relative;
    }
    .menu-container {
      li {
        height: 36px;
        line-height: 36px;
        font-size: 16px;
        padding-left: 20px;
        position: relative;
        cursor: pointer;
        margin-bottom: 20px;
        background-image: url("~/image/wxzd.png");
        background-size: 100% 100%;
        // &::after {
        //   content: "";
        //   width: 4px;
        //   height: 4px;
        //   border-radius: 50%;
        //   background: #24d6ab;
        //   position: absolute;
        //   top: 0;
        //   bottom: 0;
        //   left: 36px;
        //   margin: auto;
        //   box-shadow: 0 0 8px #24d6ab;
        // }
        // &::before {
        //   content: "";
        //   width: 8px;
        //   height: 8px;
        //   border-radius: 50%;
        //   //   border: 1px solid #24d6ab;
        //   position: absolute;
        //   top: 0;
        //   bottom: 0;
        //   left: 34px;
        //   margin: auto;
        //   box-shadow: 0 0 4px #24d6ab;
        // }
      }
      .active {
        color: #00e5fa;
        background-image: url("~/image/xzd.png");
      }
    }
  }
  .content {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    padding: 70px 30px 25px 25px;
  }
  .dd {
    padding: 0 15px;
    // > div {
    //   position: absolute;
    //   bottom: 0;
    //   left: 0px;
    //   width: 230px;
    //   height: 1px; /* 控制下边框的高度 */
    //   background: linear-gradient(
    //     244deg,
    //     rgba(255, 255, 255, 0) 0,
    //     rgb(255, 255, 255) 50%,
    //     rgba(255, 255, 255, 0) 100%
    //   );
    // }
  }
  .dd-activ {
  }
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 10px;
}

:deep(.el-table__row, .el-table th.el-table__cell, .el-table tr) {
  background-color: #003351;
  color: white;
  &:nth-child(odd) {
    background-color: #ffffff1c;
  }
  td {
    text-align: center;
  }
}
:deep(.el-table__header) {
  tr,
  .el-table__cell {
    color: white;
    text-align: center;
    background-color: #003351;
  }
}
:deep(.el-table__body tr:hover) {
  &:hover {
    > td.el-table__cell {
      background-color: rgba(5, 56, 71, 0.164);
    }
  }
}
:deep(.el-table__body-wrapper) {
  background-color: #003351;
}
:deep(.el-pagination) {
  display: flex;
  justify-content: center;
}
:deep(.el-radio-button__inner) {
  background: #005169;
  color: white;
  border: 1px solid #008893;
}
:deep(.el-radio-group .is-active .el-radio-button__inner) {
  border: 1px solid #008893;
  background: #005169 !important;
  box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
}
:deep(.el-button) {
  border-radius: 0;
  color: white;
  border: none;
  background: #008893;
}
:deep(.el-input__wrapper) {
  background: #005169;
  border-radius: 0;
  border: 1px solid #05cfda;
  box-shadow: none;
  &:hover {
    box-shadow: none;
  }
}
:deep(.el-input__inner) {
  color: white;
}
:deep(.el-button) {
  width: 160px;
}
:deep(.el-pagination) {
  .el-input__inner {
    color: white;
  }
}
:deep(.btn-prev) {
  background: #005169 !important;
}
:deep(.btn-next) {
  background: #005169 !important;
}
:deep(.btn-prev:disabled) {
  background: #005169 !important;
}
:deep(.btn-next:disabled) {
  background: #005169;
}
:deep(.el-pager) {
  li {
    background: #005169 !important;
    color: #409eff;
  }
}
</style>
