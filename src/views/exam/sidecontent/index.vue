<script lang="jsx">
import TrackPlayback from "./trackPlayback.vue";
import ExamProject from "./project.vue";
import ExamArea from "./area.vue";
import ExamCar from "./car.vue";
import ExamMain from "./main.vue";
import ExamMinee from "./examinee.vue";
import ExamMonitor from "./monitor.vue";
import backz from "~/image/back-z.png";
// import { Back } from "@element-plus/icons-vue";
import { defineComponent, computed, ref, unref, watch, reactive } from "vue";
import { useBlackStatus } from "./hooks/useBlack";
import { sideBackStore } from "@/store/modules/side";
import { useMessageChannel } from "@/hooks/useChannel";

const { back, getSideBack } = useBlackStatus();

const isTrackPlayback = location.href.includes("trackPlayback");

export default defineComponent({
  props: {
    targetCount: {
      type: Number
    }
  },

  components: {
    ExamArea,
    ExamCar,
    ExamMain,
    ExamMinee,
    ExamMonitor,
    ExamProject,
    TrackPlayback
  },

  setup(props, { slots, emit }) {
    const { webMessagePort, stringify } = useMessageChannel();
    // 监听返回按钮重置视角
    watch(getSideBack, (v) => {
      if (!v) {
        webMessagePort.postMessage(
          stringify({
            type: "main",
            category: "resetCamera"
          })
        );
      }
    });

    watch(props, (v) => {
      const menu = [
        "当前合格率：0%",
        "考试区域",
        "考试项目",
        "考试车辆",
        "考生人员",
        "监控设备"
      ];
      document.querySelector("#title").innerText = menu[v.targetCount];
    });

    const title = function () {
      if (isTrackPlayback) {
        return (
          <div id="title" class="title  text-center  color-white">
            轨迹回放
          </div>
        );
      }
      return (
        <div id="title" class="title  text-center  color-white">
          当前合格率：0
        </div>
      );
    };

    const backIcon = function (isBack) {
      if (isBack) {
        return <img class="back" src={backz} onClick={back} />;
      }
    };

    const target = function (count) {
      switch (count) {
        case 0:
          return <ExamMain targetCount={props.targetCount} />;
        case 1:
          return <ExamArea />;
        case 2:
          return <ExamProject />;
        case 3:
          return <ExamCar />;
        case 4:
          return <ExamMinee />;
        default:
          return <ExamMonitor />;
      }
    };

    // 轨迹回放
    if (isTrackPlayback) {
      return () => (
        <div class="h-100% relative">
          {title()}
          <div
            style={{
              height: "calc(100% - 40px)"
            }}
            class="exam"
          >
            <TrackPlayback />
          </div>
        </div>
      );
    }

    return () => (
      <div class="h-100% relative">
        {backIcon(unref(getSideBack))}
        {title()}
        <div
          style={{
            height: unref(getSideBack)
              ? "calc(100% - 40px)"
              : "calc(100% - 230px)"
          }}
          class="exam"
        >
          {target(props.targetCount)}
        </div>
        <div
          class="wran"
          style={{
            display: unref(getSideBack) ? "none" : "block"
          }}
        >
          {slots.default?.()}
        </div>
      </div>
    );
  }
});
</script>

<style scoped lang="less">
.title {
  height: 40px;
  line-height: 40px;
  background-image: url("~/image/titleBg.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position-x: center;
}

.wran {
  height: 190px;
}
.exam {
  height: calc(100% - 230px);
  overflow-y: scroll;
  overflow-x: hidden;
}

::-webkit-scrollbar {
  display: none;
}

:deep(.back-icon) {
  position: absolute;
  top: 10px;
  left: 4px;
  z-index: 9999;
  cursor: pointer;
}
.back {
  width: 24px;
  position: absolute;
  top: 12px;
  left: 24px;
  z-index: 9999;
  cursor: pointer;
}

:deep(.el-input__inner) {
  color: white;
}
</style>
