<script setup>
import { Close } from "@element-plus/icons-vue";
import { useMessageChannel } from "@/hooks/useChannel";
import Shadow from "../exam/shadow.vue";
const props = defineProps(["examKm", "examKcdd", "examroomName"]);
const emits = defineEmits(["close"]);

const { webMessagePort, stringify } = useMessageChannel();

/**-------------------------监听模型加载------------------------ */
// 初始化一个随机的加载进度值，用于模拟加载进度变化的效果。
const isWebglMout = ref(false);
const progress = ref(Math.floor(Math.random() * 50));
console.log(progress);
const webload = function (progress1) {
  if (progress1 === 100) {
    setTimeout(() => {
      progress.value = 100;
      setTimeout(() => {
        progress.value = 200;
        isWebglMout.value = true;
      }, 1000);
    }, 50);
  }
  console.log(`%c模型加载进度：${progress1}`, "color: blue;");
};

const handleWebglLoaded = function () {
  const { examKcdd, examKm } = props;
  console.log(`初始化场景web端传入考场id:${examKcdd}-${examKm}`);
  webMessagePort.postMessage(
    stringify({
      type: "init",
      examAreaCode: `${examKcdd}-${examKm}`
    })
  );
  window.loadScene = webload;
};

// 左侧菜单数据
const menus = ref([
  {
    name: "车管所大楼",
    buildName: "ZhuTi01",
    floor: null,
    roomName: null,
    sub: [
      {
        name: "科目二候考室",
        buildName: "ZhuTi01",
        floor: 1,
        roomName: "KeErHouKaoShi"
      },
      {
        name: "监控中心",
        buildName: "ZhuTi01",
        floor: 2,
        roomName: "JianKongZhongXin"
      }
    ]
  },
  {
    name: "理论考试大楼",
    buildName: "ZhuTi02",
    floor: null,
    roomName: null,
    sub: [
      {
        name: "理论候考室",
        buildName: "ZhuTi02",
        floor: 1,
        roomName: "YiLouLiLunHouKaoShi"
      },
      {
        name: "理论自助考试区",
        buildName: "ZhuTi02",
        floor: 1,
        roomName: "LiLunZiZhuKaoShiQu"
      },
      {
        name: "C5考试区",
        buildName: "ZhuTi02",
        floor: 1,
        roomName: "CWuKaoShiQu"
      },
      {
        name: "理论考试区(二楼)",
        buildName: "ZhuTi02",
        floor: 2,
        roomName: "ErLouLiLunKaoShiQu"
      },
      {
        name: "理论考试区(三楼)",
        buildName: "ZhuTi02",
        floor: 3,
        roomName: "SanLouLiLunKaoShiQu"
      }
    ]
  },
  {
    name: "科目二考试场地",
    buildName: "init",
    floor: null,
    roomName: null,
    sub: []
  }
]);

// 菜单点击事件
const avtiveMenu = ref("");
const handleMenuCilck = function (item) {
  const { name, buildName, floor, roomName } = item;
  avtiveMenu.value = name;
  webMessagePort.postMessage(
    stringify({
      type: "changeView",
      buildName,
      floor,
      roomName
    })
  );
};
</script>
<template>
  <div
    class="w-100vw h-100vw bg-#00000080 position-fixed top-0 left-0 right-0 bottom-0 z-9999"
  >
    <div class="content">
      <div class="h-32px">
        <el-icon
          class="float-right cursor-pointer"
          @click="emits('close')"
          size="32"
          color="cyan"
          ><Close
        /></el-icon>
        <!-- <el-icon
          class="float-right cursor-pointer m-r-12px"
          @click="emits('update:visible', false)"
          color="white"
          size="10"
        >
          <Close />
        </el-icon> -->
      </div>
      <div class="iframe-Container">
        <!-- 3d模型加载loading -->
        <div
          v-if="progress <= 100"
          class="loading w-100% h-100% position-fixed"
        >
          <div>
            <el-progress
              :text-inside="true"
              :percentage="progress"
              :stroke-width="20"
              striped-flow
              striped
            >
              <template #default="{ percentage }">
                <span>模型加载{{ percentage }}%</span>
              </template>
            </el-progress>
          </div>
        </div>
        <!-- title -->
        <div class="title">{{ props.examroomName }}</div>
        <!-- 侧边菜单栏 -->
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
              v-for="(sub, j) in menu.sub"
              :key="j"
              class="leve2"
            >
              {{ sub.name }}
            </div>
          </li>
        </ul>
        <!-- 场景 -->
        <iframe
          @load="handleWebglLoaded"
          src="/digitalTwin/Index.html"
          frameborder="0"
        ></iframe>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
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
.content {
  width: 1100px;
  height: 650px;
  margin: auto;
  margin-top: 7%;
  border-radius: 8px;
  // background: black;
  .iframe-Container {
    width: 100%;
    height: calc(100% - 32px);
    background-image: url("~/image/home-tk.png");
    background-size: 100% 100%;
    position: relative;
    .title {
      font-size: 24px;
      color: #ffffff;
      position: absolute;
      left: 40px;
      top: 20px;
      letter-spacing: 2px;
      z-index: 99;
    }
    iframe {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 9;
    }
    .menu {
      position: absolute;
      width: 200px;
      left: 40px;
      top: 100px;
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
}
</style>
