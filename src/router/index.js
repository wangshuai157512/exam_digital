import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/home/index.vue")
  },
  {
    path: "/404",
    component: () => import("@/views/Error/404.vue")
  },
  {
    path: "/login",
    component: () => import("@/views/login.vue")
  },
  {
    path: "/exam",
    component: () => import("@/views/exam/index.vue")
  },
  {
    path: "/home",
    component: () => import("@/views/home/index.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
