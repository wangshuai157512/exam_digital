<script setup>
import { computed, onMounted, watch } from "vue";
import { getComponents } from "./components";

const props = defineProps(["type"]);

const type = computed(() => props.type);

const count = ref(2);

onMounted(() => {
  if (type.value === 2) {
    count.value = 8;
  }
});
</script>

<template>
  <div class="layout">
    <!-- 连续合格分析 -->
    <div v-if="type === 0" class="side-menu">
      <div class="top-title">连续合格分析</div>
      <div class="sub-title dd">
        <div></div>
        连续合格
        <!-- <span class="font-size-24px color-#24d6ab">%</span> -->
      </div>
      <ul class="menu-container">
        <li :class="[{ active: count === 2 }]" @click="count = 2" class="dd">
          考场连续合格
          <div></div>
        </li>
        <li :class="[{ active: count === 3 }]" @click="count = 3" class="dd">
          考车连续合格
          <div></div>
        </li>
        <li :class="[{ active: count === 4 }]" @click="count = 4" class="dd">
          考台连续合格
          <div></div>
        </li>
      </ul>
      <div class="sub-title dd">
        <div></div>
        连续不合格
      </div>
      <ul class="menu-container">
        <li :class="[{ active: count === 5 }]" @click="count = 5" class="dd">
          考场连续不合格
          <div></div>
        </li>
        <li :class="[{ active: count === 6 }]" @click="count = 6" class="dd">
          考车连续不合格
          <div></div>
        </li>
        <li :class="[{ active: count === 7 }]" @click="count = 7" class="dd">
          考台连续不合格
          <div></div>
        </li>
      </ul>
    </div>
    <!-- 异地考生分析 -->
    <div v-if="type === 2" class="side-menu">
      <div class="top-title">异地考生分析</div>
      <div class="sub-box">
        <div class="sub-title dd">
          <div></div>
          合格率分析
          <!-- <span class="font-size-24px color-#24d6ab">%</span> -->
        </div>
        <ul class="menu-container">
          <li :class="[{ active: count === 8 }]" @click="count = 8" class="dd">
            考试科目合格率分析
            <div></div>
          </li>
          <li :class="[{ active: count === 9 }]" @click="count = 9" class="dd">
            考试场合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 10 }]"
            @click="count = 10"
            class="dd"
          >
            车型合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 11 }]"
            @click="count = 11"
            class="dd"
          >
            考试车合格率分析
            <div></div>
          </li>
          <!-- <li
            :class="[{ active: count === 12 }]"
            @click="count = 12"
            class="dd"
          >
            考台合格率分析
            <div></div>
          </li> -->
          <li
            :class="[{ active: count === 13 }]"
            @click="count = 13"
            class="dd"
          >
            考试原因合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 14 }]"
            @click="count = 14"
            class="dd"
          >
            驾校合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 15 }]"
            @click="count = 15"
            class="dd"
          >
            年龄段合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 16 }]"
            @click="count = 16"
            class="dd"
          >
            性别合格率分析
            <div></div>
          </li>
        </ul>
        <div class="sub-title dd">
          <div></div>
          来源地合格率分析
          <!-- <span class="font-size-24px color-#24d6ab">扣</span> -->
        </div>
        <ul class="menu-container">
          <li
            :class="[{ active: count === 17 }]"
            @click="count = 17"
            class="dd"
          >
            考试科目合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 18 }]"
            @click="count = 18"
            class="dd"
          >
            考试场合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 19 }]"
            @click="count = 19"
            class="dd"
          >
            车型合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 20 }]"
            @click="count = 20"
            class="dd"
          >
            考试车合格率分析
            <div></div>
          </li>
          <!-- <li
            :class="[{ active: count === 21 }]"
            @click="count = 21"
            class="dd"
          >
            考台合格率分析
            <div></div>
          </li> -->
          <li
            :class="[{ active: count === 22 }]"
            @click="count = 22"
            class="dd"
          >
            考试原因合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 23 }]"
            @click="count = 23"
            class="dd"
          >
            驾校合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 24 }]"
            @click="count = 24"
            class="dd"
          >
            年龄段合格率分析
            <div></div>
          </li>
          <li
            :class="[{ active: count === 25 }]"
            @click="count = 25"
            class="dd"
          >
            性别合格率分析
            <div></div>
          </li>
        </ul>
      </div>
    </div>
    <div class="content">
      <component :key="count" :is="getComponents(count)" :t="count" />
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
    .sub-box {
      height: calc(100% - 63px);
      overflow: scroll;
    }
    .top-title {
      font-size: 22px;
      padding-left: 50px;
    }
    .sub-title {
      margin-top: 30px;
      margin-bottom: 10px;
      font-size: 20px;
      // padding-left: 50px;
      text-align: center;
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
    width: calc(100% - 260px);
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
