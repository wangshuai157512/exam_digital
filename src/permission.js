import router from "@/router";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // 进度条样式
import { getToken } from "@/utils/auth";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ["/login", "/404", "/exam"];

router.beforeEach((to, from, next) => {
  NProgress.start(); // start progress bar
  if (getToken()) {
    next();
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next("/login");
    }
  }
  return true;
});

router.afterEach(() => {
  NProgress.done(); // finish progress bar
});
