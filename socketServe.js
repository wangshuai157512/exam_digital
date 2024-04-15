import fs from "fs";
// import express from "express";
import { WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 16099 });

// const server1 = new WebSocketServer({ port: 16011 });

// const socket = new WebSocket("ws://10.0.9.251:16009");

// let count = 0;

// const que = [];

// let timer1;

// console.log("start", socket);
// const connection = function (ws) {
//   timer1 = setInterval(() => {
//     ws.send(count++);
//   }, 1000);
// };

// const socket = new WebSocket("ws://10.0.1.145:16010");

// let sd;

// server.on("connection", connection);

// server1.on("connection", function (ws) {
//   socket.on("message", (m) => {
//     console.log(11);
//     ws.send(m.toString("utf8"));
//   });
// });

// server.on("close", () => {
//   console.log("22222");
// });

// socket.on("open", () => {
//   console.log("WebSocket connection opened");
// });

// socket.on("error", (error) => {
//   console.error(`WebSocket connection error: ${error.message}`);
// });

// console.log("start");

// const start = Date.now();

// while (Date.now() - start < 3000) {}
// console.log("end");
console.log("22");
let timer;
let i = 0;
let isFlage = false;

// const app = express();
const PORT = 3000; 

// app.get("/api/hello", (req, res) => {
//   isFlage = !isFlage;
//   res.json({ message: "Hello, world!" });
// });

// // 启动服务器，监听指定端口
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

fs.readFile(
  "C:/Users/superman/Documents/WeChat Files/WB251314/FileStorage/File/2024-01/新建文本文档1.txt",
  "utf8",
  (err, res) => {
    // console.log(res)
    if (err) {
      console.error(`Error reading file: ${err.message}`);
      return;
    }

    server.on("connection", (socket, req) => {
      const ip = req.socket.remoteAddress;
      const port = req.socket.remotePort;

      console.log(`New connection from ${ip}:${port}`);
      console.log("WebSocket连接已打开");
      // 读取文本文件内容
      // console.log("文件内容：", res);
      const data = JSON.parse(res).data;

      console.log("Data length:", data.length);

      timer = setInterval(() => {
        if (isFlage) return;
        socket.send(data[i++ % data.length]);
      }, 200);

      const lines = res.split("\n");
      console.log("Number of lines:", lines.length);

      socket.on("message", (message) => {
        console.log("收到消息：", message);
        socket.send(`Echo: ${message}`);
      });

      socket.on("close", () => {
        clearInterval(timer);
        console.log("WebSocket连接已关闭");
      });
    });
  }
);

// let sd;
// let d = 0;
// function sdf() {
//   clearTimeout(sd);
//   console.log(d);
//   sd = setTimeout(sdf, 1000);
//   console.log(sd);
// }
// sdf();

// function updateCanvas(callback, ms) {
//   let timer, animation;
//   return function (run) {
//     clearTimeout(timer);
//     cancelAnimationFrame(animation);

//     callback();

//     timer = setTimeout(run, ms, run);

//     animation = window.requestAnimationFrame(() => {
//       run(run);
//     });
//   };
// }

// function asd(t) {
//   const start = Date.now();
//   while (Date.now() - start <= t) {}
// }
// let start1 = Date.now();
// function qwe() {
//   console.log(1000 / (Date.now() - start1));
//   start1 = Date.now();
//   requestIdleCallback((t) => {
//     asd(t.timeRemaining());
//     qwe();
//   });
// }
// qwe();

// let start2 = Date.now();
// function qwe() {
//   console.log(1000 / (Date.now() - start2));
//   start2 = Date.now();
//   requestAnimationFrame(qwe);
// }
// qwe();

// const checkPrime = function (n) {
//   if (n % 1n || n < 2n) return 0;

//   if (n == leastFactor(n)) return 1;

//   return 0;
// };

// const leastFactor = function (n) {
//   if (n == 0n) return 0;

//   if (n % 1n || n * n < 2n) return 1;

//   if (n % 2n == 0) return 2;

//   if (n % 3n == 0) return 3;

//   if (n % 5n == 0) return 5;

//   for (let i = 7n; i * i <= n; i += 30n) {
//     if (n % i == 0n) return i;

//     if (n % (i + 4n) == 0) return i + 4n;

//     if (n % (i + 6n) == 0) return i + 6n;

//     if (n % (i + 10n) == 0) return i + 10n;

//     if (n % (i + 12n) == 0) return i + 12n;

//     if (n % (i + 16n) == 0) return i + 16n;

//     if (n % (i + 22n) == 0) return i + 22n;

//     if (n % (i + 24n) == 0) return i + 24n;
//   }

//   return n;
// };

// let count = 0;
// console.time();
// for (let i = 2; i <= 9; i++) {
//   for (let n = 2; n <= i; n++) {
//     console.log(n);
//     if (n == i) {
//       count = count + 1;
//     }
//     if (i % n == 0 && n < i) {
//       break;
//     }
//   }
// }
// console.timeEnd();
