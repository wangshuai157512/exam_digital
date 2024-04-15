<script setup>
import { bar1 } from "./echarts";
import { getExamPointItem } from "@/api/index";
import { useTableSeach } from "./hooks/useTableSeach";

const renderEcharts = function (data, echarts) {
  // 图表
  echarts.setOption(
    bar1({
      title: "扣分项统计",
      data: data.records.map((item) => {
        return {
          label: item.pointCode,
          value: item.pointNum
        };
      })
    })
  );
};

const {
  form,
  tableData,
  total,
  handleSizeChange,
  handleCurrentChange,
  search,
  formStyle,
  carTypeList
} = useTableSeach(getExamPointItem, renderEcharts);

const { date, carType, examPers } = formStyle;
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
      <el-form-item>
        <el-button class="mt-30px" @click="search" type="primary"
          >检索</el-button
        >
      </el-form-item>
    </el-form>
    <div id="table-echarts" class="echarts-container w-100%"></div>
    <div class="w-100% flex-1 flex flex-col justify-between">
      <div class="w-100% table-container mt-20px">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column width="100" prop="pointCode" label="扣分代码" />
          <el-table-column width="100" prop="pointNum" label="扣分次数" />
          <el-table-column width="100" prop="proportion" label="占比">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{ scope.row.proportion || 0 }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="扣分描述" />
          <el-table-column width="100" prop="mark" label="扣分分值" />
          <el-table-column
            width="120"
            prop="automaticEvaluation"
            label="自动评判次数"
          />
          <el-table-column
            width="120"
            prop="manualEvaluation"
            label="人工评判次数"
          />
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
