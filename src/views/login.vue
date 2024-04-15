<script setup>
import { User, Lock } from "@element-plus/icons-vue";
import { ref, unref, reactive } from "vue";
import { userStore } from "@/store/modules/user";
import { useRouter } from "vue-router";
import usericon from "@/assets/image/user.png";
import pwdicon from "@/assets/image/pwd.png";
// 数据
const user = userStore();
const { push } = useRouter();
const from = ref({
  // 用户名
  userName: null,
  // 密码
  password: null
});
// 加载loading
const isLoading = ref(false);
// 是否有错
const isErr = ref(false);
// 错误信息
const errMsg = ref("");

// 登录点击事件
const loginGo = function () {
  if (!unref(from).userName || !unref(from).password) {
    errMsg.value = "请填写用户名和密码";
    isErr.value = true;

    setTimeout(() => {
      isErr.value = false;
    }, 2000);
    return;
  }

  isLoading.value = true;
  user
    .loginSetUser(unref(from))
    .then(() => {
      isLoading.value = false;
      push("/home");
    })
    .catch((err) => {
      console.log(err);
      isLoading.value = false;
    });
};
</script>
<template>
  <div class="bg h-screen p-20px position-relative">
    <div
      class="bg-cent w-600px h-600px position-absolute left-0 right-0 top-0 bottom-0 m-auto"
    >
      <p class="font-700 font-size-35px text-center color-#00ced7">
        驾驶人考试数智化监管平台
      </p>
      <div
        v-if="isErr"
        class="b-msg w-520px text-center line-height-36px color-white mt-20px mb-20px h-36px m-auto b-1px border-solid border-rd-4px"
      >
        {{ errMsg }}
      </div>
      <div v-else class="h-36px mt-20px mb-20px"></div>
      <div class="b-login m-auto w-500px h-400px bg-#00ced7 p-t-60px">
        <h2 class="text-center color-#00ced7 font-400 m-b-50px">用户登录</h2>
        <el-input
          v-model="from.userName"
          size="large"
          placeholder="请输入账号"
          @keyup.enter="loginGo"
        >
          <template #prefix>
            <img :src="usericon" class="w-12px" />
          </template>
        </el-input>
        <el-input
          type="password"
          v-model="from.password"
          size="large"
          placeholder="请输入密码"
          @keyup.enter="loginGo"
        >
          <template #prefix>
            <img :src="pwdicon" class="w-12px" />
          </template>
        </el-input>
        <el-button
          @click="loginGo"
          :loading="isLoading"
          class="w-350px m-auto m-t-50px color-black"
          size="large"
          type="primary"
          >登录</el-button
        >
      </div>
    </div>
    <footer
      class="position-absolute left-0 right-0 bottom-12px m-auto text-center color-white font-size-16px"
    >
      技术支持：北京精英智通科技股份有限公司 &nbsp;&nbsp;&nbsp;&nbsp; 软件版本号：V1.5.0
    </footer>
  </div>
</template>
<style lang="less" scoped>
.b-msg {
  border: 1px red solid;
  background: rgba(255, 0, 0, 0.219);
}
.bg {
  background-image: url("~/image/bg.png");
  background-size: 100%;
}

.b-login {
  background-image: url("~/image/bg-login.png");
  background-size: 100%;
}

.el-input {
  width: 70%;
  display: block;
  margin: 20px auto;
  :deep(.el-input__wrapper) {
    width: 100%;
    background: none;
    box-shadow: 0 0 0 1px rgb(11, 118, 184);
    ::placeholder {
      color: white;
    }
    input {
      color: white;
    }
  }
}

button {
  display: block;
  background: #00ced7;
  color: black;
  font-size: 16px;
  font-weight: 700;
  &:hover {
    background: #00ced7;
    color: black;
  }
}
</style>
