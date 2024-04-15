<script setup>
import { onMounted, watch } from "vue";
import { bar, bar1, bar2 } from "./echarts";
import {
  getExamResultPlacePass,
  getExamResultPlacePassChart,
  getExaminer,
  getExamSchool,
} from "@/api/index";
import { useTableSeach } from "./hooks/useTableSeach";

const props = defineProps(["t"]);
const labelT = computed(() => props.t);
const type = ref({
  17: {
    label: "考试科目",
    value: "kskm",
  },
  18: {
    label: "考试场",
    value: "kcxh",
  },
  19: {
    label: "车型",
    value: "kscx",
  },
  20: {
    label: "考试车",
    value: "hphm",
  },
  21: {
    label: "考台",
    value: "ktxh",
  },
  22: {
    label: "考试原因",
    value: "ksyy",
  },
  23: {
    label: "驾校",
    value: "jxxh",
  },
  24: {
    label: "年龄段",
    value: "age",
  },
  25: {
    label: "性别",
    value: "xb",
  },
});
let queryForm = { groupField: "kskm" };

queryForm.groupField = type.value[labelT.value].value;

const age = ref("");
watch(age, () => {
  queryForm.ageStart = age.value.split("-")[0];
  queryForm.ageEnd = age.value.split("-")[1];
});

const echartsData = ref([]);

const renderEcharts = function (data, echarts) {
  let dataNum = [];
  let xdata = [];
  let title = [];
  if (echartsData.value.length > 0) {
    echartsData.value.forEach((item) => {
      const d = new Array(item.field.length);

      item.field.forEach((jtem, index) => {
        const t = item.fieldMap[jtem];
        if (t) {
          d[index] = t;
        } else {
          d[index] = 0;
        }
      });

      dataNum.push(d);
    });
 

    xdata = echartsData.value.map((item) => {
    return item.city;
  });
    title = echartsData.value[0].field.map((item) => {
    return getLabel(labelT.value, item);
  });
}
  // 图表
  echarts.setOption(bar2(xdata, dataNum, title),true);
};

const request = function (from) {
  return new Promise(function (resolve, reject) {
    getExamResultPlacePass(from).then((r) => {
      // 图表
      getExamResultPlacePassChart(from).then((res) => {
        echartsData.value = res;
        resolve(r);
      });
    });
  });
};

const {
  form,
  tableData,
  total,
  handleSizeChange,
  handleCurrentChange,
  search,
  formStyle,
  examReasons,
  carTypeList,
  examRoomList,
} = useTableSeach(request, renderEcharts, queryForm);
const {
  date,
  carType, // 日期
  reason, // 考试原因
  examNum, // 考试次数
  examPers, // 考试人员
  school, // 驾校
  judge, // 评判方式
} = formStyle;

// 考试员列表
const examIner = ref([]);
// 驾校列表列表
const examSchool = ref([]);


const studentTypeList = [
  {
    label: "全国",
    value: "0",
  },
  {
    label: "省内",
    value: "1",
  },
  {
    label: "省外",
    value: "2",
  },
];
const kmList = [
  {
    label: "科目一",
    value: "1",
  },
  {
    label: "科目二",
    value: "2",
  },
  {
    label: "科目三",
    value: "3",
  },
  {
    label: "科目三文明驾驶",
    value: "4",
  },
];

const sexList = [
  {
    label: "男",
    value: "1",
  },
  {
    label: "女",
    value: "2",
  },
];

const ageList = [
  {
    label: "18-25",
    value: "18-25",
  },
  {
    label: "26-35",
    value: "26-35",
  },
  {
    label: "36-45",
    value: "36-45",
  },
  {
    label: "46-55",
    value: "66-55",
  },
  {
    label: "56-70",
    value: "56-70",
  },
];

const examReason = [
  {
    label: "初次申领",
    value: "A",
  },
  {
    label: "增驾申请",
    value: "B",
  },
  {
    label: "补证换证",
    value: "C",
  },
  {
    label: "满分学习",
    value: "F",
  },
];

const getLabel = function (count, groupField) {
  const labels = {
    17: kmList,
    22: examReason,
    25: sexList,
  };

  if (labels[count]) {
    const target = labels[count].find((item) => item.value === groupField);
    if (target) {
      return target.label;
    }
    return "";
  }

  return groupField;
};
const searchs = function () {
  form.ageStart = queryForm.ageStart;
  form.ageEnd = queryForm.ageEnd;
  search();
};

onMounted(() => {
  getExaminer().then((res) => {
    examIner.value = res;
  });
  getExamSchool().then((res) => {
    examSchool.value = res;
  });
});
</script>

<template>
  <div ref="refForm" class="flex flex-col h-100% overflow-scroll">
    <el-form
      :inline="true"
      label-position="top"
      :model="form"
      label-width="120px"
    >
      <el-form-item label="考生分类">
        <el-select
          :style="{ width: `${160}px` }"
          clearable
          filterable
          class="w-150px"
          v-model="form.source"
          placeholder="请选择"
        >
          <el-option
            v-for="item in studentTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考试科目">
        <el-select
          :style="{ width: `${160}px` }"
          clearable
          filterable
          class="w-150px"
          v-model="form.subject"
          placeholder="请选择"
        >
          <el-option
            v-for="item in kmList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考试场">
        <el-select
          :style="{ width: `${school}px` }"
          clearable
          filterable
          class="w-150px"
          v-model="form.examroomId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in examRoomList"
            :key="item.examroomId"
            :label="item.examroomName"
            :value="item.examroomId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="驾校名称">
        <el-select
          :style="{ width: `${school}px` }"
          clearable
          filterable
          class="w-150px"
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
      <el-form-item label="考试原因">
        <el-select
          clearable
          filterable
          class="w-120px"
          v-model="form.reason"
          :style="{ width: `${reason}px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in examReason"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="性别">
        <el-select
          clearable
          filterable
          class="w-150px"
          v-model="form.sex"
          :style="{ width: `${examPers}px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in sexList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄段">
        <el-select
          clearable
          filterable
          class="w-150px"
          v-model="age"
          :style="{ width: `${examPers}px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in ageList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
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
      <el-form-item>
        <el-button class="mt-30px" @click="searchs" type="primary"
          >检索</el-button
        >
      </el-form-item>
    </el-form>
    <div id="table-echarts" class="echarts-container w-100%"></div>
    <div class="w-100% flex-1 flex flex-col justify-between">
      <div class="w-100% table-container mt-20px">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="city" label="地市" width="200" />
          <el-table-column prop="" :label="type[labelT].label" width="210">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{ getLabel(labelT, scope.row.groupField) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="total" label="考试人数" />
          <el-table-column prop="success" label="合格人数" />
          <el-table-column prop="otherPass" label="外地合格率（%）">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{ Number(scope.row.otherPass).toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="otherProportion" label="外地考生占比(%)">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{ Number(scope.row.otherProportion).toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="localPass" label="本地合格率（%）">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{ Number(scope.row.localPass).toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="exceed" label="考超出、低于百分点">
            <template #default="scope">
              <div style="text-align: center">
                <span>{{ Number(scope.row.exceed).toFixed(2) }}</span>
              </div>
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
</template>
<style scoped lang="less">
.echarts-container {
  height: 300px;
  border-radius: 10px;
  // background: #182f41;
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
  height: auto;
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
