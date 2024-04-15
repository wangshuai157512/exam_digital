import { setupQutsideDirective } from "./clickOutside";

/**
 * 导出指令：v-xxx
 * @methods clickOutside 点击节点以外: v-clickOutside
 */
export const setupQutside = (app) => {
  setupQutsideDirective(app);
};
