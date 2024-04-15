import { defineStore } from "pinia";
import { login } from "@/api/index";
import { store } from "@/store";
import { Base64 } from "js-base64";
import { setToken } from "@/utils/auth";

export const userStore = defineStore("user", {
  state: () => ({
    user: null
  }),
  getters: {
    // 获取用户信息
    getUser: (state) => {
      return state.user;
    }
  },
  actions: {
    // 登陆获取用户信息
    loginSetUser({ userName, password }) {
      return new Promise((resolve, reject) => {
        login({
          userName: Base64.encode(userName),
          password: Base64.encode(password)
        })
          .then((res) => {
            if (res) {
              setToken(res);
              resolve();
            } else {
              reject();
            }
          })
          .catch(reject);
      });
    }
  }
});

export const userStoreWithOut = () => {
  return userStore(store);
};
