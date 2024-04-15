import { formStyle } from "../style.js";
import { init } from "echarts";
import { getMonthDate } from "@/utils/day";
import { reactive, onMounted, unref } from "vue";
import { examReasons } from "@/dict/index";
import { getExamRoomInfo } from "@/api/index";

export const useTableSeach = function (api, renderEcharts, option = {}) {
  const tableData = ref([]);

  const total = ref(0);

  const echarts = ref(null);
  // 考试车型
  const carTypeList = ref(['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'C3', 'C4', 'C5', 'D', 'E', 'F']);
  const examRoomList = ref([]);

  // 初始化echarts
  onMounted(() => {
    if (document.querySelector("#table-echarts")) {
      echarts.value = init(unref(document.querySelector("#table-echarts")));
    }
  });

  onMounted(() => {
    getExamRoomInfo().then((res) => {
      if (res) {
        examRoomList.value = res;
      }
    });

  });
  // 检索表单 默认一个月时间
  const form = reactive({
    pageSize: 10,
    pageNum: 1,
    examStartTIme: getMonthDate(-1, "YYYY-MM-DD"),
    examEndTIme: getMonthDate(0, "YYYY-MM-DD"),
    ...option
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
    carTypeList,
    examRoomList,
    echarts
  };
};
