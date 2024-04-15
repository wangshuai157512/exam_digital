<script setup>
import { formStyle } from "./style.js";
import { onMounted } from "vue";
import {
  getExamResult,
  getExaminer,
  getExamSchool,
  getCarType
} from "@/api/index";
import { examStore } from "@/store/modules/exam";
import { getMonthDate } from "@/utils/day";

const exam = examStore();

const examId = unref(computed(() => exam.getExamId));

const tableData = ref([]);

const total = ref(0);

const {
  date,
  carType, // 日期
  reason, // 考试原因
  examNum, // 考试次数
  examPers, // 考试人员
  school, // 驾校
  judge // 评判方式
} = formStyle;

const carTypeList = ref([]);
onMounted(() => {
  getCarType(examId).then((res) => {
    if (res) {
      carTypeList.value = res.kkcx.split(",");
    }
  });
});

// 检索表单
const form = reactive({
  pageSize: 10,
  pageNum: 1,
  examroomId: examId,
  examStartTIme: getMonthDate(-1, "YYYY-MM-DD"),
  examEndTIme: getMonthDate(0, "YYYY-MM-DD")
});

// 获取表格数据及渲染图表
const getPageTable = function () {
  getExamResult(form).then((res) => {
    total.value = Number(res.total);
    tableData.value = res.records;
  });
};

// 修改页码数量
const handleSizeChange = function () {
  getPageTable();
};

// 修改目标页码
const handleCurrentChange = function () {
  getPageTable();
};

// 检索
const search = function () {
  form.pageNum = 1;
  getPageTable();
};

onMounted(getPageTable);

const resultOptions = [
  // { value: 0, label: "未判定" },
  { value: 1, label: "成绩合格" },
  { value: 2, label: "成绩不合格" }
];

// 考试员列表
const examIner = ref([]);
onMounted(() => {
  getExaminer().then((res) => {
    examIner.value = res;
  });
});

// 驾校列表列表
const examSchool = ref([]);
onMounted(() => {
  getExamSchool().then((res) => {
    examSchool.value = res;
  });
});

const examOptions = [
  { value: 1, label: "第一次" },
  { value: 2, label: "第二次" }
];
</script>

<template>
  <div ref="refForm" class="flex flex-col h-100% overflow-scroll">
    <el-form
      :inline="true"
      label-position="top"
      :model="form"
      label-width="120px"
    >
      <el-form-item label="考试开始日期">
        <el-date-picker
          :style="{ width: `${date}px` }"
          value-format="YYYY-MM-DD"
          v-model="form.examStartTIme"
          type="date"
          placeholder="请选择"
        />
      </el-form-item>
      <el-form-item label="考试结束日期">
        <el-date-picker
          :style="{ width: `${date}px` }"
          value-format="YYYY-MM-DD"
          class="w-180px"
          v-model="form.examEndTIme"
          type="date"
          placeholder="请选择"
        />
      </el-form-item>
      <el-form-item label="考试车型">
        <el-select
          clearable
          filterable
          class="w-120px"
          v-model="form.vehicle"
          :style="{ width: `${carType}px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in carTypeList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="驾校名称">
        <el-select
          clearable
          filterable
          class="w-150px"
          :style="{ width: `${school}px` }"
          v-model="form.drivingSchoolId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in examSchool"
            :key="item.jxxh"
            :label="item.jxjc"
            :value="item.jxxh"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考试员">
        <el-select
          clearable
          filterable
          class="w-150px"
          v-model="form.examinant"
          :style="{ width: `${examPers}px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in examIner"
            :key="item.sfzmhm"
            :label="item.xm"
            :value="item.xm"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考试结果">
        <el-select
          clearable
          filterable
          class="w-150px"
          v-model="form.examResult"
          :style="{ width: `100px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in resultOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考试次数">
        <el-select
          class="w-120px"
          clearable
          filterable
          v-model="form.examNum"
          :style="{ width: `${examNum}px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in examOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名/身份证号">
        <el-input
          :style="{ width: `184px` }"
          v-model="form.nameOrCard"
          placeholder="请填写"
        />
      </el-form-item>
      <el-form-item label="车牌号码">
        <el-input
          :style="{ width: `120px` }"
          v-model="form.licensePlate"
          placeholder="请填写"
        />
      </el-form-item>
      <!-- <el-form-item label="场地设备编号">
        <el-input
          :style="{ width: `120px` }"
          v-model="form.equipmentId"
          placeholder="请填写"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button class="mt-30px" @click="search" type="primary"
          >检索</el-button
        >
      </el-form-item>
    </el-form>
    <div class="w-100% flex-1 flex flex-col justify-between">
      <div class="w-100% table-container mt-20px">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column width="120" prop="name" label="姓名" />
          <el-table-column width="180" prop="cardId" label="身份证号" />
          <el-table-column width="100" prop="vehicleModel" label="考试车型" />
          <el-table-column width="120" prop="examDate" label="考试日期" />
          <el-table-column width="100" prop="examMark" label="考试成绩" />
          <el-table-column width="100" prop="examResult" label="考试结果">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{
                  scope.row.examResult === "1" ? "合格" : "不合格"
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="100" prop="kscs" label="考试次数" />
          <el-table-column width="100" prop="examinant" label="考试员" />
          <el-table-column width="100" prop="licensePlate" label="车牌号码" />
          <el-table-column prop="schoolName" label="驾校名称" />
        </el-table>
      </div>
      <div class="h-10px"></div>
      <el-pagination
        small
        background
        :page-sizes="[10, 20, 50]"
        v-model:page-size="form.pageSize"
        v-model:current-page="form.pageNum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="sizes, prev, pager, next"
        :total="total"
      />
    </div>
  </div>
</template>
<style scoped lang="less">
.echarts-container {
  height: 300px;
  border-radius: 10px;
  // background: #182f41;
}

:deep(.el-input__wrapper) {
  background-color: #c0c6cb;
}

:deep(.el-table__row, .el-table th.el-table__cell, .el-table tr) {
  background-color: #061f33;
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
    background-color: #061f33;
  }
}
:deep(.el-table__body tr:hover) {
  &:hover {
    > td.el-table__cell {
      background-color: rgba(5, 56, 71, 0.164);
    }
  }
}

.table-container {
  height: calc(100% - 44px);
  overflow-y: scroll;
  position: relative;
  &::after,
  &::before {
    content: "";
    width: 1px;
    height: 100%;
    background: #061f33;
    position: absolute;
    top: 0;
    z-index: 999;
  }
  &::before {
    right: 0;
  }
  &::after {
    left: 0;
  }
}
:deep(.el-pagination) {
  justify-content: center;
}
:deep(.el-scrollbar__view) {
  background: #061f33;
}
</style>
