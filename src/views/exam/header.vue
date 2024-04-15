<script lang="jsx">
import { defineComponent, computed } from "vue";
import tj from "@/assets/image/tj.png";
import cz from "@/assets/image/cz.png";
import details from "@/assets/image/details.png";
import logout from "@/assets/image/logout.png";
import back from "@/assets/image/back.png";
import { modalStore } from "@/store/modules/modal";
import { useMessageChannel } from "@/hooks/useChannel";
import { removeToken } from "@/utils/auth";
import { warnStore } from "@/store/modules/warn";

const modal = modalStore();
const { addModalSet } = modal;

const warn = warnStore();

const warnTotal = computed(() => warn.warnTotal);

const isTrackPlayback = location.href.includes("trackPlayback");

// 预警
const handleWarn = function () {
  addModalSet(1);
};

// 统计
const handleStatistics = function () {
  addModalSet(2);
};

// 轨迹回放
const handleTrackPlayback = function () {
  addModalSet(3);
};

// 退出
const handleLogout = function () {
  ElMessageBox.confirm("确定要退出吗?", "", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(() => {
      // 轨迹回放关闭窗口
      if (isTrackPlayback) {
        window.close();
        return;
      }
      removeToken();
      location.href = "/";
    })
    .catch(() => {});
};

// 返回
const handleBack = function () {
  window.history.back();
};

export default defineComponent({
  props: {
    count: {
      type: Number
    }
  },
  setup() {
    const title = "驾驶人考试数智化监管平台";
    // 重置视角
    const { webMessagePort, stringify } = useMessageChannel();
    const handleRest = function (e) {
      webMessagePort.postMessage(
        stringify({
          type: "main",
          category: "resetCamera"
        })
      );
    };

    const renderwarnTotal = function (warnTotal) {
      if (warnTotal > 0) {
        return <span class="count">{warnTotal}</span>;
      }
    };

    const renderTrackPlayback = function () {
      if (isTrackPlayback) {
        return (
          <>
            {title}
            <div class="right">
              <img
                onClick={handleLogout}
                class="w-85px h-35px"
                src={logout}
                alt=""
              />
            </div>
          </>
        );
      }
      return (
        <>
          {title}
          <div class="left">
            <img onClick={handleBack} class="w-85px h-35px" src={back} alt="" />
          </div>
          <div class="right">
            {renderwarnTotal(warnTotal.value)}
            <div onClick={handleWarn} class="b"></div>
            <img onClick={handleStatistics} class="b" src={tj} alt="" />
            <img onClick={handleRest} class="b" src={cz} alt="" />
            <div onClick={handleTrackPlayback} class="c m-r-20px">
              {" "}
            </div>
            <img
              onClick={handleLogout}
              class="w-85px h-35px"
              src={logout}
              alt=""
            />
          </div>
        </>
      );
    };

    return () => (
      <div class="c w-100% position-absolute top-0 z-99 h-6% font-900 font-size-9 flex flex-justify-center color-white flex-items-center">
        {renderTrackPlayback()}
      </div>
    );
  }
});
</script>

<style scoped lang="less">
.c {
  background-image: url("~/image/header.png");
  background-size: 100% 100%;
}

.count {
  padding: 0px 4px;
  background: red;
  position: absolute;
  font-size: 10px;
  border-radius: 8px;
  left: 35px;
  top: 10px;
}

.left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  display: flex;
  align-items: center;
  img {
    cursor: pointer;
  }
}
.right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 20px;
  display: flex;
  align-items: center;
  > div {
    background-image: url("~/image/yj.png");
    background-size: 100%;
    background-repeat: no-repeat;
    cursor: pointer;
  }
  img {
    cursor: pointer;
  }
  .b {
    width: 50px;
    height: 50px;
  }
  .c {
    width: 58px;
    height: 58px;
    background-image: url("~/image/details.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
}
</style>
