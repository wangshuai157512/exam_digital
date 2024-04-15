import { onUnmounted, reactive } from "vue";
import { examStore } from "@/store/modules/exam";
import qs from "qs";
const webSocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

export const useSocketCar = function () {
  const exam = examStore();

  const examKcdd = unref(computed(() => exam.getExamKcdd));

  const OFFLINE_TIME = 1000 * 5; // 超过5s没有数据推送就默认离线
  // 维护车辆超时id集合
  const carOffLineTimeMap = new Map();
  // 全部考场在线车辆集合
  const examRoomOnlineMap = new Map();
  // 首页统计考场现在车辆数
  const examRoomOnlineNum = reactive({});

  // 当前考场车辆集合
  const carMap = reactive({});

  // 获取车辆
  const getCar = function (carId) {
    return carMap[carId];
  };

  let ws;

  // 处理websocket信息
  const handerMessage = function (e) {
    try {
      const m = decodeURIComponent(e.data).split("$header,")[1].split(",");
      const f = decodeURIComponent(e.data).split("$footer,")[1];
      const roomId = m[30].split("+")[1]; // 考场id
      const carId = `${m[0]}-${Number(m[1])}`; // 考车id
      const id = m[20].split("+")[1]; // 考生身份证号码
      const status = Number(m[5]); // 考试状态
      const examNo = Number(m[6]); // 考试次数
      const examinee = m[2]; // 考生姓名
      const examnum = m[3]; // 考生分数
      const details = qs.parse(f); // 扣分及项目明细
      // const currentProject = m[23]; // 当前考试项目编码
      // const deduction = m[24]; // 扣分项目

      if (!examRoomOnlineMap.has(roomId)) {
        examRoomOnlineMap.set(roomId, new Map());
      }
      // 获取这个考场
      const room = examRoomOnlineMap.get(roomId);

      if (!room.has(carId)) {
        room.set(carId, 1);
        // 考场在线车辆加1
        examRoomOnlineNum[roomId] = (examRoomOnlineNum[roomId] || 0) + 1;
        console.log(`%c${roomId}考场:${carId}车辆上线`, "color: #21df95;");
      }

      // 存在定时器就清除
      if (carOffLineTimeMap.has(`${roomId}-${carId}`)) {
        const carOffTime = carOffLineTimeMap.get(`${roomId}-${carId}`);
        clearTimeout(carOffTime);
      }
      
      // 车辆离线定时器
      const carOffTime = setTimeout(() => {
        const onLineNum = examRoomOnlineNum[roomId];
        examRoomOnlineNum[roomId] = onLineNum > 0 ? onLineNum - 1 : 0;
        if (examKcdd === roomId) {
          delete carMap[carId];
        }
        room.delete(carId);
        console.log(`%c${roomId}考场:${carId}车辆离线`, "color: red;");
      }, OFFLINE_TIME);

      carOffLineTimeMap.set(`${roomId}-${carId}`, carOffTime);

      // 当前考场的车辆
      if (examKcdd === roomId) {
        // 优化 当车载数据无变化时不修改map
        if (
          !carMap[carId] ||
          carMap[carId].examnum !== examnum ||
          carMap[carId].status !== status ||
          (id && carMap[carId].id !== id) ||
          qs.stringify(carMap[carId].details) != qs.stringify(details)
        ) {
          carMap[carId] = {
            status,
            examNo,
            examnum,
            details,
            examinee, // 考生姓名
            id: id || null
          };
        }
      }
    } catch (error) {
      console.log(`协议解析错误：${error}`);
    }
  };

  let retryTimer,
    retryCount = 0;

  const retryConnect = function () {
    retryTimer = setTimeout(() => {
      if (ws.readyState === 3) {
        ws.removeEventListener("message", handerMessage);
        connectWebSocket();
        console.log(`%c车载websocket重连次数：${++retryCount}`, "color: red;");
        return;
      }
      retryConnect();
    }, 4000);
  };

  // 连接失败重试
  const connectWebSocket = function () {
    ws = new WebSocket(webSocketUrl); // ws://192.168.153.234:16009 本地 ws://10.0.1.145:8080 服务 ws://10.0.9.251:16009
    ws.addEventListener("message", handerMessage);
    retryConnect();
  };

  // 等待websocket 关闭后重新连接新的
  setTimeout(connectWebSocket, 100);

  // 清除定时器
  onUnmounted(() => {
    clearTimeout(retryTimer);
    carOffLineTimeMap.forEach((carOffTime) => {
      clearTimeout(carOffTime);
    });
  });

  // 清除事件
  onUnmounted(() => {
    ws.close();
    ws.removeEventListener("message", handerMessage);
  });

  // 清除map
  onUnmounted(() => {
    carOffLineTimeMap.clear();
    examRoomOnlineMap.clear();
  });

  return { carMap, getCar, examRoomOnlineNum };
};
