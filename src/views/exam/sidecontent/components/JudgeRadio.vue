<script setup>
import { computed, ref, onMounted, unref, reactive, watch } from "vue";
import { CaretBottom } from "@element-plus/icons-vue";
import { examCarPointList, examCarPoint } from "@/api/index";
import { examStore } from "@/store/modules/exam";

const props = defineProps({
  height: Number,
  id: String
});

const exam = examStore();

const examId = unref(computed(() => exam.getExamId));

const divideTarget = ref("");
const divideMenu = [
  { label: "全部", code: "" },
  { label: "5分", code: "5" },
  { label: "10分", code: "10" },
  { label: "100分", code: "100" }
];
const judgeTarget = ref("");
const judgeMenu = ref([]);

const deductJudgeForm = reactive({
  examId,
  type: "C",
  itemCode: judgeTarget,
  mark: divideTarget
});
const deductJudgeList = ref([]);

watch([() => deductJudgeForm.itemCode, () => deductJudgeForm.mark], () => {
  examCarPointList(deductJudgeForm).then((res) => {
    if (res) {
      deductJudgeList.value = res;
    }
  });
});

const getJudgeList = function () {
  examCarPointList({ type: "B", examId }).then((res) => {
    if (res.length) {
      judgeMenu.value = res;
      judgeTarget.value = res[0].xmdm;
    }
  });
};

const judgeTargetName = computed(
  () => unref(judgeMenu).find((item) => item.xmdm === unref(judgeTarget))?.xmmc
);

onMounted(() => {
  getJudgeList();
});

const targetDataTableColumn = ref(null);

const handleJudge = function () {
  ElMessageBox.confirm("确定要扣分吗?", "", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(() => {
      const { xmdm, kfz } = unref(targetDataTableColumn);
      examCarPoint({ id: props.id, itemCode: xmdm, mark: kfz, examId }).then(
        (res) => {
          ElMessage({
            type: "success",
            message: "提交成功"
          });
        }
      );
    })
    .catch(() => {});
};

onMounted(() => {
  console.log(props.id);
  // examCarPointList({ type: "C" });
});

const height = computed(() => `${props.height}px`);
</script>
<template>
  <div :style="{ height }" class="box-border p-8px h-600px page">
    <div class="title h-30px text-center line-height-30px color-white">
      人工评判
    </div>
    <div class="judge-leve flex color-white justify-between m-t-12px">
      <el-popover
        popper-class="popper"
        :teleported="false"
        placement="bottom-start"
        width="calc(100% - 40px)"
        trigger="hover"
      >
        <template #reference>
          <div class="text-ovf flex-1 m-r-8px flex items-center active">
            <el-icon class="m-r-4px m-l-4px"><CaretBottom /></el-icon>
            <p>{{ judgeTargetName }}</p>
          </div>
        </template>
        <template #default>
          <div class="b-con">
            <!-- <div
              @click="judgeTarget = -1"
              :class="[{ active: judgeTarget === -1 }]"
              class="current w-100% m-b-4px"
            >
              通用
            </div> -->
            <div class="judge-container">
              <div
                @click="judgeTarget = item.xmdm"
                :class="[{ active: judgeTarget === item.xmdm }]"
                v-for="(item, index) in judgeMenu"
                :key="index"
              >
                {{ item.xmmc }}
              </div>
            </div>
          </div>
        </template>
      </el-popover>
      <div
        :class="[{ active: divideTarget === item.code }]"
        @click="divideTarget = item.code"
        v-for="(item, index) in divideMenu"
        :key="index"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="table-container">
      <div class="table-title">
        <div>扣分代码</div>
        <div class="miaoshu">扣分描述</div>
        <div>扣分分值</div>
      </div>
      <div
        v-for="(item, index) in deductJudgeList"
        @click="targetDataTableColumn = item"
        :class="[
          {
            active:
              targetDataTableColumn && targetDataTableColumn.xmdm === item.xmdm
          }
        ]"
        class="table-data"
        :key="index"
      >
        <div>{{ item.xmdm }}</div>
        <div class="miaoshu">{{ item.xmmc }}</div>
        <div>{{ item.kfz }}分</div>
      </div>
    </div>
    <el-button @click="handleJudge" class="button bg-#093b68 w-100% m-t-15px"
      >扣分</el-button
    >
  </div>
</template>
<style scoped lang="less">
.title {
  //   background-image: url("~/image/titleBg.png");
  //   background-size: contain;
  //   background-repeat: no-repeat;
  //   background-position-x: center;
}

.judge-leve {
  > div {
    width: 15%;
    text-align: center;
    padding: 4px 0;
    border: 1px #08d6d1 solid;
    // border-radius: 4px;
    // margin-left: 2px;
    font-size: 12px;
    cursor: pointer;
    &:hover {
      background: #1c6178;
    }
  }
}

.button {
  background-color: #093b68 !important;
  color: white;
  border: 1px solid #05c6d2;
}

.judge-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 第一行一个元素 */
  grid-gap: 4px;
}

.current,
.judge-container > div {
  // text-align: center;
  background: #13465d;
  // border-radius: 2px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  padding: 3px;
}

.b-con {
  background: #093b68;
  padding: 4px 4px;
}

.table-container {
  margin-top: 10px;
  > div {
    display: flex;
    justify-content: space-between;
    color: white;
    box-sizing: border-box;
    padding: 0 4px;
    div {
      width: 60px;
      padding: 10px 0;
      display: flex;
      align-items: center;
    }
    .miaoshu {
      flex: 1;
      margin: 0 10px;
    }
  }
}

.table-title {
  font-size: 14px;
  margin-bottom: 2px;
}

.table-data {
  font-size: 14px;
  cursor: pointer;
  background-color: #13465d;
  margin-bottom: 4px;
  box-sizing: border-box;

  // &:nth-child(even) {
  //   background-color: #cccccc69; /* 设置偶数行的背景色 */
  // }
  // &:hover {
  //   background: #02f0f496;
  // }
}

.page {
  overflow-y: scroll;
}
.page::-webkit-scrollbar {
  display: none;
}

:deep(.el-popper) {
  background-color: #093b68 !important;
  border: none;
  padding: 4px;
}

:deep(.el-popper.is-light .el-popper__arrow::before) {
  background-color: #13465d !important;
}

.active {
  box-shadow: inset 0px 0px 15px 0px #00ff72 !important;
  border: 1px solid #00ff72 !important;
}

.text-ovf {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
