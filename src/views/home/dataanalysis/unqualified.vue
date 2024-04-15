<script setup>
import { onMounted, reactive, watch } from "vue";
import { bar } from "./echarts";
import { getExamResultPass, getExaminer, getExamSchool } from "@/api/index";
import { useTableSeach } from "./hooks/useTableSeach";

const props = defineProps(["t"]);

const t = computed(() => props.t);

const tableData = [
  {
    ksc: "五尧科目二考场",
    kcbh: 1,
    xm: "卿怜烟",
    sfz: "230102196904010006",
    cx: "C1",
    kscj: 0,
    hgbj: "不合格",
    lxhg: 1,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州方圆汽车",
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 2,
    xm: "卿怜烟",
    sfz: "230102196904020006",
    cx: "C1",
    kscj: 70,
    hgbj: "不合格",
    lxhg: 2,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州方圆汽车",
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 3,
    xm: "司空半兰",
    sfz: "230102197804020007",
    cx: "C1",
    kscj: 0,
    hgbj: "不合格",
    lxhg: 3,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: null,
    ksyy: "初次申领",
    nld: "26-35",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 4,
    xm: "国代天",
    sfz: "230102196804010004",
    cx: "C1",
    kscj: 0,
    hgbj: "不合格",
    lxhg: 4,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州方圆汽车",
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 5,
    xm: "国代天",
    sfz: "230102196804020004",
    cx: "C1",
    kscj: 0,
    hgbj: "不合格",
    lxhg: 5,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州方圆汽车",
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 6,
    xm: "孙樱丹",
    sfz: "23010220060402000X",
    cx: "C1",
    kscj: 70,
    hgbj: "不合格",
    lxhg: 6,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: null,
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 7,
    xm: "孙樱丹",
    sfz: "23010220060401000X",
    cx: "C1",
    kscj: 0,
    hgbj: "不合格",
    lxhg: 7,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: null,
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 8,
    xm: "李召朋",
    sfz: "130481198306183651",
    cx: "C1",
    kscj: 70,
    hgbj: "不合格",
    lxhg: 8,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州蓝天驾校",
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 9,
    xm: "李召朋",
    sfz: "130481198306183651",
    cx: "C1",
    kscj: 70,
    hgbj: "不合格",
    lxhg: 9,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州蓝天驾校",
    nld: "26-35",
    ksyy: "初次申领",
    xb: "男"
  },
  {
    ksc: "五尧科目二考场",
    kcbh: 11,
    xm: "八雨寒",
    sfz: "230102199604020003",
    cx: "C1",
    kscj: 70,
    hgbj: "不合格",
    ksyy: "初次申领",
    lxhg: 10,
    kssj: "10:22:30",
    jssj: "10:52:30",
    jx: "黔西南州方圆汽车",
    nld: "26-35",
    xb: "男"
  }
];
const total = tableData.length;

const renderEcharts = function (data, echarts) {
  // 图表
  //   echarts.setOption(
  //     bar({
  //       title: "考场合格率",
  //       legendData: ["合格率", "考生人数"],
  //       data: tableData.map((item) => {
  //         return {
  //           label: item.examDate,
  //           a: item.passRate,
  //           b: item.examPersonNum
  //         };
  //       })
  //     })
  //   );
};

const {
  handleSizeChange,
  handleCurrentChange,
  // search,
  formStyle,
  examReasons,
  carTypeList
} = useTableSeach(getExamResultPass, renderEcharts);

const form = reactive({});

const {
  date,
  carType, // 日期
  reason, // 考试原因
  examNum, // 考试次数
  examPers, // 考试人员
  school, // 驾校
  judge // 评判方式
} = formStyle;

const examOptions = [
  { value: 1, label: "第一次" },
  { value: 2, label: "第二次" }
];

// 考试员列表
const examIner = ref([]);
// 驾校列表列表
const examSchool = ref([]);
const groupList = ref([
  {
    label: "年龄段",
    value: "0"
  },
  {
    label: "考试科目",
    value: "1"
  },
  {
    label: "考试原因",
    value: "2"
  }
]);

const groupValue = ref("0");
const kmList = ref([]);
const examList = ref([
  {
    label: "昌平考场",
    value: "2"
  },
  {
    label: "海淀考场",
    value: "3"
  }
]);
const sexList = ref([
  {
    label: "男",
    value: "1"
  },
  {
    label: "女",
    value: "2"
  }
]);
const ageList = ref([
  {
    label: "18-25",
    value: "1"
  },
  {
    label: "26-35",
    value: "2"
  },
  {
    label: "36-45",
    value: "3"
  },
  {
    label: "66-55",
    value: "4"
  },
  {
    label: "56-70",
    value: "5"
  }
]);
const type = ref({
  0: "examDate",
  1: "km"
});
onMounted(() => {
  getExaminer().then((res) => {
    examIner.value = res;
  });
  getExamSchool().then((res) => {
    examSchool.value = res;
  });
  kmList.value = [
    {
      label: "科目一",
      value: "2"
    },
    {
      label: "科目二",
      value: "2"
    },
    {
      label: "科目三",
      value: "3"
    },
    {
      label: "科目三文明驾驶",
      value: "4"
    }
  ];
});

const lxhg = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

const searchs = function () {
  form.grouping = unref(groupValue);
  search();
};
</script>

<template>
  <div ref="refForm" class="flex flex-col h-100% overflow-scroll">
    <el-form
      :inline="true"
      label-position="top"
      :model="form"
      label-width="120px"
    >
      <el-form-item label="考试科目">
        <el-select
          :style="{ width: `${160}px` }"
          clearable
          filterable
          class="w-150px"
          v-model="form.km"
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
          v-model="form.schoolId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in examList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考车/考台">
        <el-input v-model="form.kc" placeholder="请输入内容"></el-input>
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
      <el-form-item label="连续合格">
        <el-select
          :style="{ width: `${120}px` }"
          clearable
          filterable
          class="w-150px"
          v-model="form.asd"
          placeholder="请选择"
        >
          <el-option
            v-for="item in lxhg"
            :key="item"
            :label="item"
            :value="item"
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
            v-for="item in examReasons"
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
          v-model="form.age"
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
      <el-form-item label="分组类别">
        <el-select
          clearable
          filterable
          class="w-150px"
          v-model="groupValue"
          :style="{ width: `160px` }"
          placeholder="请选择"
        >
          <el-option
            v-for="item in groupList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button class="mt-30px" @click="searchs" type="primary"
          >检索</el-button
        >
      </el-form-item>
    </el-form>
    <!-- <div id="table-echarts" class="echarts-container w-100%"></div> -->
    <div class="w-100% flex-1 flex flex-col justify-between">
      <div class="w-100% table-container mt-20px">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column width="140" prop="ksc" label="考试场" />
          <el-table-column width="100" prop="kcbh" label="考车编号" />
          <el-table-column width="120" prop="xm" label="姓名" />
          <el-table-column width="180" prop="sfz" label="身份证号" />
          <el-table-column prop="cx" label="车型" />
          <el-table-column width="120" prop="ksyy" label="考试原因" />
          <el-table-column width="100" prop="kscj" label="考试成绩" />
          <el-table-column width="120" prop="hgbj" label="合格标记" />
          <el-table-column width="120" prop="lxhg" label="连续不合格" />
          <el-table-column width="120" prop="kssj" label="开始时间" />
          <el-table-column width="120" prop="jssj" label="结束时间" />
          <el-table-column width="140" prop="jx" label="驾校" />
          <el-table-column prop="nld" label="年龄段" />
          <el-table-column prop="xb" label="性别" />
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
