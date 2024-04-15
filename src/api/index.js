import request from "@/config/axios";
import qs from "qs";
// 登陆
export const login = (data) => {
  return request.post({
    url: "/oauth/login/exam/v4.0",
    headersType: "application/x-www-form-urlencoded",
    data: { macaddress: "MzQ6N0Q6RjY6MzQ6RkU6RjQ=", ...data }
  });
};

// 考场区域树
export const examAreaTree = (kcxh) => {
  return request.get({
    url: `/equipment/region/tree?kcxh=${kcxh}`
  });
};

// 考场区域
export const examarea = (examid) => {
  return request.get({
    url: `/examarea/list?examId=${examid}`
  });
};

// 考场区域详情
export const itemInfo = (examid) => {
  return request.get({
    url: `/examarea/itemInfo?examId=${examid}`
  });
};

// 考车列表
export const examCarList = (data) => {
  return request.get({
    url: `/examcar/list?${qs.stringify(data)}`,
    isLoading: false
  });
};

// 考车合格率
export const examCarPassrate = (examId) => {
  return request.get({
    url: `/examcar/passrate?examId=${examId}`,
    isLoading: false
  });
};

// 扣分详情
export const getExamCarPointInfo = (data) => {
  return request.get({
    url: `/examcar/point/info?${qs.stringify(data)}`
  });
};

// 考车详情
export const examCarInfo = (data) => {
  return request.get({
    url: `/examcar/info?${qs.stringify(data)}`,
    isLoading: false
  });
};

// 更新车辆状态
export const examCarUpdateStatus = (data) => {
  return request.get({
    url: `/examcar/update/status?${qs.stringify(data)}`,
    isLoading: false
  });
};

// 人工评判扣分列表
export const examCarPointList = (data) => {
  return request.get({
    url: `/examcar/point/list?${qs.stringify(data)}`
  });
};

// 连续合格人数预警
export const examCarPass = (examId) => {
  return request.get({
    url: `/examcar/continuous/pass?examId=${examId}`,
    isLoading: false
  });
};

// 人工评判扣分列表
export const examCarPoint = (data) => {
  return request.get({
    url: `/examcar/point?${qs.stringify(data)}`
  });
};

// 根据扣分代码查扣分详细信息
export const getCodePoint = (code) => {
  return request.get({
    url: `/examcar/point/code/info?itemCode=${code}`
  });
};

// 考试人员列表
export const personList = (data) => {
  return request.post({
    url: `/homepage/person/list`,
    data,
    isLoading: false
  });
};

// 考试人员详情
export const personInfo = (data) => {
  return request.post({
    url: `/homepage/person/info`,
    data
  });
};

// 监控设备列表
export const equipmentList = (data) => {
  return request.post({
    url: `/equipment/list`,
    data
  });
};

/**--------------------------------------首页-------------------------------------- */
// 今日预警
export const getWarn = () => {
  return request.get({
    url: `/homepage/detachment/warn`
  });
};

// 今日预警更多
export const getWarnFurther = () => {
  return request.get({
    url: `homepage/detachment/warn/further`
  });
};

// 考场考试安排
export const getExamMange = () => {
  return request.post({
    url: `/homepage/detachment/exam/mange`
  });
};

// 考场考试安排 更多
export const getExamMangeFurther = () => {
  return request.post({
    url: `/homepage/detachment/exam/mange/further`
  });
};

// 各科目考试进度
export const getExamSubject = () => {
  return request.post({
    url: `/homepage/detachment/exam/subject/schedule`,
    isLoading: false
  });
};

// 考试结果统计
export const getExamResults = () => {
  return request.get({
    url: `/homepage/detachment/exam/result/statistics`,
    isLoading: false
  });
};

// 考生年龄分析
export const getExamAge = (kskm = "") => {
  return request.get({
    url: `/homepage/detachment/candidates/age/analysis?kskm=${kskm}`,
    isLoading: false
  });
};

// 异地考生分析
export const getExamPlace = (kskm = "") => {
  return request.get({
    url: `/homepage/detachment/candidates/otherPlace/analysis?kskm=${kskm}`,
    isLoading: false
  });
};

// 考生性别分析
export const getExamSex = (kskm = "") => {
  return request.get({
    url: `/homepage/detachment/candidates/sex/analysis?kskm=${kskm}`,
    isLoading: false
  });
};

// 报考车型分析
export const getExamVehicle = (kskm = "") => {
  return request.get({
    url: `/homepage/detachment/exam/vehicle/analysis?kskm=${kskm}`,
    isLoading: false
  });
};

// 各科目考试进度 更多
export const getExamSubjectFurther = () => {
  return request.post({
    url: `/homepage/detachment/exam/subject/schedule/further`
  });
};

// 支队考试科目趋势统计
export const getExamSubjectTrend = () => {
  return request.post({
    url: `/homepage/detachment/exam/subject/trend`,
    isLoading: false
  });
};

// 考场信息
export const getExamRoomInfo = () => {
  return request.get({
    url: `/homepage/detachment/examroom`,
    isLoading: false
  });
};

// 考车合格率统计
export const getExamCar = () => {
  return request.post({
    url: `/homepage/detachment/car`
  });
};

// 项目扣分分析
export const getPoint = () => {
  return request.get({
    url: `/homepage/detachment/item/point`
  });
};

// 今年累计考试信息
export const getExamIneesNum = () => {
  return request.get({
    url: `/homepage/detachment/examineesnum`
  });
};

/**--------------------------主界面-------------------------------- */

// 预警统计
export const getWranNum = (examId) => {
  return request.get({
    url: `/homepage/exam/exam?examId=${examId}`
  });
};

// 考生人数统计
export const getExamIneeNum = (examId) => {
  return request.get({
    url: `/homepage/exam/examinee?examId=${examId}`
  });
};

/**--------------------------预警-------------------------------- */

// 实时预警查询
export const findWaringRealTime = (data) => {
  return request.post({
    url: `/warning/findWaringRealTime`,
    data,
    isLoading: false
  });
};

// 预警分页查询
export const getWarningPage = (data) => {
  return request.post({
    url: `/warning/list`,
    data
  });
};

// 预警分页查询统计
export const getWarningStatistic = (data) => {
  return request.post({
    url: `/warning/statistic`,
    data
  });
};

/**--------------------------预警详情-------------------------------- */
// 详情
export const getWarningInfo = (data) => {
  return request.post({
    url: `/warning/info`,
    data
  });
};

// 预警处理
export const warningProcess = (data) => {
  return request.post({
    url: `/warning/process`,
    data
  });
};

// 预警上报
export const warningReport = (data) => {
  return request.post({
    url: `/warning/report`,
    data
  });
};

// 考场预警
export const getExamRoomWran = (data) => {
  return request.post({
    url: `/warning/exma/findWaringRealTime`,
    data,
    isLoading: false
  });
};
/**--------------------------数据统计-------------------------------- */
// 考场合格率
export const getExamRoom = (data) => {
  return request.post({
    url: `/data/analysis/exam/pass`,
    data
  });
};

// 考试员列表
export const getExaminer = () => {
  return request.get({
    url: `/examiner/list`
  });
};

// 驾校列表
export const getExamSchool = () => {
  return request.get({
    url: `/examschool`
  });
};

// 驾校合格率
export const getExamSchoolPass = (data) => {
  return request.post({
    url: `/data/analysis/exam/school/pass`,
    data
  });
};

// 考车合格率
export const getExamCarPass = (data) => {
  return request.post({
    url: `/data/analysis/exam/car/pass`,
    data
  });
};

// 考试项目合格率
export const getItemPass = (data) => {
  return request.post({
    url: `/data/analysis/exam/item/pass`,
    data
  });
};

// 考试员合格率
export const getExamInantPass = (data) => {
  return request.post({
    url: `/data/analysis/examinant/pass`,
    data
  });
};

// 扣分项分析
export const getExamPointItem = (data) => {
  return request.post({
    url: `/data/analysis/point/item`,
    data
  });
};

// 考试员扣分分析
export const getExaminant = (data) => {
  return request.post({
    url: `/data/analysis/examinant/point`,
    data
  });
};

// 人工评判分析
export const getPointLabour = (data) => {
  return request.post({
    url: `/data/analysis/point/labour`,
    data
  });
};

// 考试结果明细统计
export const getExamResult = (data) => {
  return request.post({
    url: `/data/analysis/exam/result`,
    data
  });
};

// 考车类型
export const getCarType = (examId) => {
  return request.get({
    url: `/homepage/exam/exam/info?examId=${examId}`
  });
};
//----------------------轨迹回放----------------------//
// 考试结果明细详情
export const getResultInfo = (examId) => {
  return request.get({
    url: `/data/analysis/exam/result/info?examId=${examId}`
  });
};

// 考试照片信息
export const getExamPhoto = (examId) => {
  return request.get({
    url: `/data/analysis/exam/result/photo/info?ksgcxh=${examId}`
  });
};

// 异地考生合格率
export const getExamResultPass = (data) => {
  return request.post({
    url: `/data/analysis/exam/result/place/other/pass`,
    data
  });
};

// 来源地地考生合格率
export const getExamResultPlacePass = (data) => {
  return request.post({
    url: `/data/analysis/exam/result/place/source/pass`,
    data
  });
};

// 来源地地考生图表
export const getExamResultPlacePassChart = (data) => {
  return request.post({
    url: `/data/analysis/exam/result/place/source/pass/chart`,
    data
  });
};
