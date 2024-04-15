const debug = false;// 调试模式 true 开启

// 获取父级环境
var parentEnv = top.document.querySelector('#app').getAttribute('env');

console.log("parentEnv", parentEnv);
const env = parentEnv; // dev 开发环境 pro 公司 wy 五尧

// 轨迹回放的websocket环境
const trackEnv = parentEnv; // dev 开发环境 pro 公司 wy 五尧

// 车载协议WS配置
if (env == "dev") {
    var vehicleProtoUrl = "ws://10.0.9.251:16009";// 本地 ws://localhost:18088
} else if (env == "pro") {
    var vehicleProtoUrl = "ws://10.0.9.251:16009";// 公司内部中转地址 ws://10.0.3.149:16009
} else if (env == "wy") {
    var vehicleProtoUrl = "ws://192.168.153.234:16009";// 五尧中转地址
} else {
    var vehicleProtoUrl = "ws://192.168.153.234:16009";// 线上中转地址
}

// 轨迹回放WS配置
if (trackEnv == "ZJH") {
    var trackProtoUrl = "ws://10.0.1.145:8080";// 璟弘测试地址
} else if (trackEnv == "dev") {
    var trackProtoUrl = "ws://10.0.9.77:10031/ws/gps/RANDOM";// 本地 ws://localhost:18088
} else if (trackEnv == "LRJ") {
    var trackProtoUrl = "ws://10.0.3.205:9033/ws/gps/RANDOM";// 刘仁杰测试地址
} else if (trackEnv == "pro") {
    var trackProtoUrl = "ws://10.0.9.77:10031/ws/gps/RANDOM";// 公司内部中转地址
} else if (trackEnv == "wy") {
    var trackProtoUrl = "ws://192.168.153.234:9033/ws/gps/RANDOM";// 五尧中转地址
} else {
    var trackProtoUrl = "ws://192.168.153.234:9033/ws/gps/RANDOM";// 线上中转地址
}