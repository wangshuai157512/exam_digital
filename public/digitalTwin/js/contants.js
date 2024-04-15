/**
 * 一些常量
 */
// const examAreaLableWidth = "70px";  // 考试区域里面标签的宽度
// const examAreaLableRight = "-38px"; // 考试区域里面标签距右（调整居中）
// const examCarLableWidth = "150px";  // 考试车辆里面标签的宽度
// const examCarLableRight = "-78px";  // 考试车辆里面标签距右（调整居中）
// const examCarDeductDetailWidth = "200px"; // 考试车辆里面扣分信息宽度 详细信息
// const examCarDeductDetailRight = "-92px";   // 考试车辆里面扣分信息距右（调整居中）详细信息
// const examCarDeductSimpleWidth = "60px"; // 考试车辆里面扣分信息宽度 只显示扣分
// const examCarDeductSimpleRight = "-20px";   // 考试车辆里面扣分信息距右（调整居中） 只显示扣分
// const examPersonalWidth = "150px"; // 考试车辆里面扣分信息宽度
// const examPersonalRight = "-30px";   // 考试车辆里面扣分信息距右（调整居中）


const imgPath = "./image/"; // 图片的固定路径

const carModelUrl = "./EXAMAREACODE/CARTYPE/Car.FBX";// 车辆模型地址
const carRigidBodyModelUrl = "./EXAMAREACODE/CARTYPE/rigidbody/Car.FBX";// 车辆刚体模型地址
const sceneUrl = "./EXAMAREACODE/Scene/Scene.FBX";// 场景地址
const sceneIndexUrl = "./EXAMAREACODE/Scene/Index/SceneIndex.FBX";// 场景地址
const sceneUrl_poqi = "./EXAMAREACODE/Scene/PZ/Scene.FBX";// 场景地址


const INIT = "init";   //考场初始化
const MAINS = "main";   //类目切换参数

const MAININTERFACE = "mainInterface";  //主界面
const EXAMAREA = "examArea";    //考试区域
const EXAMPROJECT = "examProject";    //考试区域
const EXAMCAR = "examCar";  //考试车辆
const EXAMPERSONAL = "examPersonal";    //考试人员
const MONITORINGEQUIPMENT = "monitoringEquipment";  //监控设备
const EXAMMONITOR = "examMonitor"; // 点击监控设备详情
const TRACKPLAYBACK = "trackPlayback"; // 轨迹回放
const EXITTRACKPLAYBACK = "exitTrackPlayback"; // 退出轨迹回放
const RESETCAMERA = "resetCamera"; //初始化摄像机
const CHANGEVIEW = "changeView";  // 改变视角
const WARN = "warn"; // 预警

var modelNamePreFix = {
  "FK001-2": "SL_WuYao_K2_",        // 五尧科目二模型前缀
  "FK007-2": "SL_JingXiao_K2_",     // 警校科目二模型前缀
  "FK007-3": "SL_JingXiao_K3_",                    // 警校科目三模型前缀
  "5223303-3": "SL_JingXiao_K3_"                   // 警校科目三模型前缀（公司）
}

const INTRACKPLAYBACK = "inTrackPlayback";; //进入轨迹回放
const CHANGETRACKPLAYBACK = "changeTrackPlayback";; //选择播放轨迹回放

const deductMsgTime = 3000; //扣分提示信息UI在3D内的自动关闭时间 按ms为单位

const carRefreshTime = 5; //监听车载协议，超过此时间隐藏车辆 按s为单位

/**
 * 这个clamp函数接受一个value、一个min和一个max参数，并返回将value限制在min和max之间的结果。它使用Math.max和Math.min来确保值不超出指定的范围。
 * @param {*} value 
 * @param {*} min 
 * @param {*} max 
 * @returns 
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(num) {

  return String(num).padStart(2, '0');
  // 使用三元运算符添加零
  // return num < 10 ? '0' + num : num.toString();
}

// 获取 时分秒 工具类
class TimeUtils {
  static getCurrentTime() {// 获得 时分秒 格式的事件 HHmmss
    const date = new Date();
    const hours = TimeUtils.formatTimeUnit(date.getHours());
    const minutes = TimeUtils.formatTimeUnit(date.getMinutes());
    const seconds = TimeUtils.formatTimeUnit(date.getSeconds());
    return `${hours}${minutes}${seconds}`;
  }

  static getCurTimeStamp() {
    const timestamp = Date.now();
    return timestamp;
  }

  static formatTimeUnit(unit) {
    return unit < 10 ? '0' + unit : unit;
  }

  static getCurrentTimeAndColon() {// 获得 时:分:秒 格式的事件 HH:mm:ss
    const date = new Date();
    const hours = TimeUtils.formatTimeUnit(date.getHours());
    const minutes = TimeUtils.formatTimeUnit(date.getMinutes());
    const seconds = TimeUtils.formatTimeUnit(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
  }

  static formatHHmmssTimeStamp(timestamp) {
    // 将时间戳转换为 JavaScript Date 对象
    const date = new Date(parseInt(timestamp));

    // 获取时、分、秒
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    // 拼接成特定格式的时间字符串，比如：YYYY-MM-DD HH:mm:ss
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime;
  }


  static formatYYYYMMddHHmmssTimeStamp(timestamp) {
    // 将时间戳转换为 JavaScript Date 对象
    const date = new Date(timestamp);

    // 获取年、月、日、小时、分钟和秒
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    // 拼接成特定格式的时间字符串，比如：YYYY-MM-DD HH:mm:ss
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedTime;
  }
}



// 加载js
function loadScripts(urls, callback) {
  var loadedCount = 0;
  var totalScripts = urls.length;

  function loadScript(url) {
    var script = document.createElement('script');
    script.src = url;

    script.onload = function () {
      loadedCount++;
      if (loadedCount === totalScripts) {
        if (callback) {
          callback();
        }
      }
    };

    if (checkFileExists(url)) {
      document.head.appendChild(script);
    }

  }

  for (var i = 0; i < urls.length; i++) {
    loadScript(urls[i]);
  }
}

// 校验文件是否存在
function checkFileExists(url) {

  try {

    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send();

    if (xhr.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // 处理错误
    console.log('发生错误:', error);
    return false;
  }
}

function random() {
  // 给定数字数组
  const numbers = [0, 2, 3];
  // 生成随机索引，范围是 [0, 数组长度)
  const randomIndex = Math.floor(Math.random() * numbers.length);
  // 通过随机索引获取随机数
  const randomValue = numbers[randomIndex];
  return randomValue;
}

function randomScore() {
  // 给定数字数组
  const numbers = [60, 70, 80, 90];
  // 生成随机索引，范围是 [0, 数组长度)
  const randomIndex = Math.floor(Math.random() * numbers.length);
  // 通过随机索引获取随机数
  const randomValue = numbers[randomIndex];
  return randomValue;
}

function generateUUID() {
  let d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); // 获取更高精度的时间
  }
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

// 使用async/await
function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}


function test1() {
  // 输入的字符串
  var inputString = "$header,C1,2,司空半兰,100,20231110172837100070,2,1,47.0472158772,-43.2032332063,19.621900,256.520000,-2.250000,0.000000,0,0,-5759604.1676039500,1738465.0167516796,0.000000,0.000000,0.000000,0.000000+440881199511100007,2190311100007,02002002222222222222,0,^^,0+2500,0.99,1100000010001004000000001,0.000000,2,1+FK001,2,z*";

  // 使用正则表达式匹配$header，并切割成两条数据
  var headerRegex = /\$header,[^$]+/g;
  var matches = inputString.match(headerRegex);

  // 输出匹配的结果
  console.log(matches);
}
