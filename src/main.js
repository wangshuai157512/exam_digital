import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/";
import { setupStore } from "./store";
import { channel } from "./messagechannel/index";
import "@/permission";
import "virtual:uno.css";
import "@/styles/index.less";
import "@/assets/fonts/font.less";
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { setupQutside } from "./directives";

const app = createApp(App);

window.message = [];

// 配置store
setupStore(app);
app.use(router);
app.use(channel);

app.use(ElementPlus, {
  locale: zhCn
});

// 自定义指令
app.use(setupQutside);

// 性能追踪
app.config.performance = true;

// 路由准备完毕再挂载
router.isReady().then(() => app.mount("#app"));
