import { examStore } from "@/store/modules/exam";
import { formStyle } from "../style.js";
import { init } from "echarts";
import { getMonthDate } from "@/utils/day";
import { reactive, onMounted, unref } from "vue";
import { examReasons } from "@/dict/index";
import { getCarType } from "@/api/index";

const exam = examStore();
export const useTableSeach = function (api, renderEcharts) {
  const examId = unref(computed(() => exam.getExamId));
  const tableData = ref([]);

  const total = ref(0);

  const echarts = ref(null);
  // 考试车型
  const carTypeList = ref([]);

  // 初始化echarts
  onMounted(() => {
    echarts.value = init(unref(document.querySelector("#table-echarts")));
  });

  onMounted(() => {
    getCarType(examId).then((res) => {
      if (res) {
        carTypeList.value = res.kkcx.split(",");
      }
    });
  });

  // 检索表单 默认一个月时间
  const form = reactive({
    pageSize: 10,
    pageNum: 1,
    examStartTIme: getMonthDate(-1, "YYYY-MM-DD"),
    examEndTIme: getMonthDate(0, "YYYY-MM-DD"),
    examroomId: examId
  });

  // 获取表格数据及渲染图表
  const getPageTable = function () {
    api(form).then((res) => {
      total.value = Number(res.total);
      tableData.value = res.records;
      renderEcharts(res, unref(echarts));
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

  return {
    tableData,
    total,
    form,
    handleSizeChange,
    handleCurrentChange,
    search,
    formStyle,
    examReasons: examReasons.option,
    carTypeList
  };
};
