<script setup>
import { Close } from "@element-plus/icons-vue";
import { modalStore } from "@/store/modules/modal";
import { getCarType, getExamResult } from "@/api/index";
import { examStore } from "@/store/modules/exam";
import { getMonthDate } from "@/utils/day";

const modal = modalStore();
const { addModalSet, removeModalSet, setModalParam } = modal;

const exam = examStore();
const examId = unref(computed(() => exam.getExamId));

const result = [
  { label: "合格", value: "1" },
  { label: "不合格", value: "2" }
];

const carTypeList = ref([]);
onMounted(() => {
  getCarType(examId).then((res) => {
    if (res) {
      carTypeList.value = res.kkcx.split(",");
    }
  });
});

const examOptions = [
  { value: 1, label: "第一次" },
  { value: 2, label: "第二次" },
  { value: 3, label: "第三次" }
];

const tableData = ref([]);
const total = ref(0);

const form = reactive({
  pageSize: 20,
  pageNum: 1,
  examroomId: examId,
  examStartTIme: getMonthDate(-1, "YYYY-MM-DD"),
  examEndTIme: getMonthDate(0, "YYYY-MM-DD")
});
// 获取表格数据及渲染图表
const getPageTable = function () {
  getExamResult({ ...form }).then((res) => {
    total.value = Number(res.total);
    tableData.value = res.records;
  });
};

onMounted(getPageTable);

// 修改页码数量
const handleSizeChange = function () {
  getPageTable();
};

// 修改目标页码
const handleCurrentChange = function () {
  getPageTable();
};

const handleClick = function (row) {
  setModalParam(row);
  addModalSet(4);
};

const seach = function () {
  form.pageNum = 1;
  getPageTable();
};

onMounted(() => {
  const r = document.querySelector(".el-table");
  r.style.setProperty("--el-table-border-color", "#ffffff00");
});
</script>
<template>
  <div class="containers">
    <div class="title">
      <div class="sub-title">考试记录</div>
      <el-icon @click="removeModalSet(3)" size="36" color="cyan"
        ><Close
      /></el-icon>
    </div>
    <div class="table-container">
      <el-form
        :inline="true"
        label-position="top"
        :model="form"
        label-width="120px"
      >
        <el-form-item label="考试结果">
          <el-select
            clearable
            filterable
            class="w-120px"
            v-model="form.examResult"
            :style="{ width: `100px` }"
            placeholder="请选择"
          >
            <el-option
              v-for="item in result"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试车型">
          <el-select
            clearable
            filterable
            class="w-120px"
            v-model="form.vehicle"
            :style="{ width: `100px` }"
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
        <el-form-item label="考车编号">
          <el-input
            :style="{ width: `160px` }"
            v-model="form.carNum"
            placeholder="请填写"
          />
        </el-form-item>
        <el-form-item label="考试次数">
          <el-select
            class="w-120px"
            clearable
            filterable
            v-model="form.examNum"
            :style="{ width: `100px` }"
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
        <el-form-item label="考试开始日期">
          <el-date-picker
            :style="{ width: `160px` }"
            value-format="YYYY-MM-DD"
            v-model="form.examStartTIme"
            type="date"
            placeholder="请选择"
          />
        </el-form-item>
        <el-form-item label="考试结束日期">
          <el-date-picker
            :style="{ width: `160px` }"
            value-format="YYYY-MM-DD"
            class="w-180px"
            v-model="form.examEndTIme"
            type="date"
            placeholder="请选择"
          />
        </el-form-item>
        <el-form-item>
          <el-button class="mt-30px" @click="seach" type="primary"
            >检索</el-button
          >
        </el-form-item>
      </el-form>
      <div class="w-100% flex-1 flex flex-col justify-between">
        <div class="w-100% mt-20px">
          <el-table :data="tableData" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column width="120" prop="name" label="姓名" />
            <el-table-column width="180" prop="cardId" label="身份证号" />
            <el-table-column width="100" prop="vehicleModel" label="考试车型" />
            <el-table-column width="100" prop="carNum" label="考车编号" />
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
            <el-table-column width="180" prop="startTime" label="开始时间" />
            <el-table-column width="180" prop="endTime" label="结束时间" />
            <el-table-column width="100" prop="examinant" label="考试员" />
            <el-table-column width="100" prop="licensePlate" label="考车号牌" />
            <el-table-column width="200" prop="schoolName" label="驾校名称" />
            <el-table-column fixed="right" label="操作" width="100">
              <template #default="scope">
                <span
                  class="details-btn"
                  style="cursor: pointer"
                  @click="handleClick(scope.row)"
                  >详情</span
                >
              </template>
            </el-table-column>
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
  z-index: 999;
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
  .table-container {
    width: 100%;
    height: calc(100% - 52px);
    padding: 10px 20px;
    overflow: scroll;
  }
  :deep(.el-form-item__label) {
    color: white;
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
  :deep(.el-table__body tr) {
    > td.el-table__cell {
      background-color: rgba(5, 56, 71, 0.164);
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
  :deep(.el-pagination) {
    .el-input__inner {
      color: white;
    }
  }
  :deep(.btn-prev) {
    background: #005169;
  }
  :deep(.btn-next) {
    background: #005169;
  }
  :deep(.btn-prev:disabled) {
    background: #005169;
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
  :deep(.el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf) {
    border-bottom: none;
  }
  :deep(.el-table--border th.el-table__cell) {
    border-bottom: none;
  }
  :deep(.el-table--border .el-table__cell) {
    border-right: none;
  }
  :deep(.el-table) {
    border: none;
  }
  :deep(.details-btn) {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 1px;
      background: white;
      left: 0;
      bottom: 0px;
    }
  }
}
</style>
