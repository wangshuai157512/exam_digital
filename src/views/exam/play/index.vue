<script lang="jsx">
import Progress from "./progress.vue";
import PlayVideo from "./video.vue";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch
} from "vue";
import { formattedDate } from "@/utils/day.js";
import { parseUrlParams, utcTimestamp } from "@/utils/index.js";
import { playStore } from "@/store/modules/play";
import { useMessageChannel } from "@/hooks/useChannel";

const play = playStore();

let playedType = null; // webgl | video 视频或者模型开始播放

export default defineComponent({
  props: {
    isWebglMout: {
      type: Boolean
    }
  },

  components: {
    Progress,
    PlayVideo
  },

  emits: ["trackplay", "trackpause", "trackchange"],

  setup(props, { emit, expose }) {
    let delayTimer, // 延迟播放定时器
      webRtcVideo, // 视频元素
      webRtcServer, // 视频服务器
      progressTime = 0, // 进度条时间
      isTriggerProgress = false,
      isWebgled = false, // 是否触发进度条
      timeLong = 0;

    // 获取视频元素节点
    onMounted(() => {
      webRtcVideo = document.getElementById("webRtcVideo");
    });

    // 清除定时器
    onUnmounted(() => {
      clearTimeout(delayTimer);
      clearTimeout(webgl.timer);
    });

    // 播放状态
    const isPlay = ref(false);

    // 播放当前时间
    const currentTime = ref(0);

    // 是否为视频回放
    const isBackPlay = computed(() => play.getBackPlayStatus);

    // 获取视频url
    const playUrl = computed(() => play.getPlayUrl);

    const format = "YYYYMMDDTHHmmss[Z]";

    // 更新视频地址开始时间实现快进
    const updatePlayUrlStartTime = function (newTimestamp) {
      return playUrl.value.replace(/(starttime=)[^&]+/, `$1${newTimestamp}`);
    };

    class WebglStatus {
      constructor() {
        this.timer = null;
        this.isPause = false; // 是否暂停
      }
      // 更新时间
      updateTime() {
        clearTimeout(this.timer);
        // 末尾播放结束
        if (currentTime.value >= timeLong && !this.isPause) {
          currentTime.value = 0;
          progressTime = 0;
          isPlay.value = false;
          webRtcVideo.pause();
          return;
        } else if (!isTriggerProgress && !this.isPause) {
          currentTime.value = currentTime.value + 1000;
        }
        // 轮询调用
        this.timer = setTimeout(() => {
          this.updateTime();
        }, 1000);
      }
      // 暂停
      pause() {
        this.isPause = true;
        isPlay.value = false;
      }
      // 播放
      play() {
        if (!this.isPause) {
          this.updateTime();
        }
        isPlay.value = true;
        this.isPause = false;
      }
    }

    // 3d模型开始播放
    const { webMessagePort } = useMessageChannel();

    const webgl = new WebglStatus();

    onMounted(() => {
      if (!props.isWebglMout) return;
      playedType = "webgl";
      isPlay.value = true;
      webgl.updateTime();
    });

    const webGlPlayed = function () {
      isWebgled = true;
      playedType = "webgl";
      isPlay.value = true;
      webgl.updateTime();
    };

    // 视频回放
    const playBack = function () {
      // 解析视频地址时间
      const { starttime, endtime } = parseUrlParams(playUrl.value);
      const startTime = utcTimestamp(starttime);
      const endTime = utcTimestamp(endtime);

      // 根据传入时间戳计算视频时长
      timeLong = endTime - startTime;
      // 创建webRtc成功
      const creatdWebRtcServer = function (webRtc) {
        webRtcServer = webRtc;
        webRtcServer.connect(playUrl.value);
      };

      // 手动触发时间进度条
      const handleProgressTimeUpdate = function (ms) {
        isTriggerProgress = true;
        currentTime.value = ms * 1000;
      };

      // 放开鼠标时触发
      const handleProgressChangeUp = function () {
        isTriggerProgress = false;
        progressTime = currentTime.value;
        // 如果将时间拖到视频结尾, 则重置暂停
        if (progressTime === timeLong) {
          webRtcServer.disconnect();
        } else {
          // 播放所选时间进度的视频
          webRtcServer.connect(
            updatePlayUrlStartTime(
              formattedDate(startTime + progressTime, format)
            )
          );
        }
        emit("trackchange", {
          startTime: startTime + progressTime,
          endTime
        });
        webgl.isPause = false;
        isPlay.value = true;
        webgl.updateTime();
      };

      // 播放
      const handleProgressPlay = function () {
        const currentStartTime = startTime + currentTime.value;
        webRtcServer.connect(
          updatePlayUrlStartTime(formattedDate(currentStartTime, format))
        );
        webgl.play();
        emit("trackplay", {
          startTime: currentStartTime,
          endTime
        });
      };

      // 点击暂停
      const handleProgressPause = function () {
        webRtcVideo.pause();
        emit("trackpause");
        webgl.pause();
      };

      // 触发视频暂停并保存当前进度时间
      const handleVideoPause = function () {
        isPlay.value = false;
        progressTime = currentTime.value;
        console.log("%c视频暂停", "color: red;");
      };

      // 视频已经开始播放
      const handleVideoPlay = function () {
        isPlay.value = true;
        console.log("%c视频已经开始播放", "color: #05ff00;");
      };

      // 视频更新时间触发进度条
      const handleVideoTimeUpdate = function (event) {
        const targetTime = Math.ceil(event.target.currentTime) * 1000;
        // 视频开始播放修改类型
        if (!playedType) {
          playedType = "video";
        } else if (playedType === "webgl") {
          return;
        }
        // 如果播放到结尾断开连接
        if (targetTime + progressTime >= timeLong) {
          webRtcServer.disconnect();
          currentTime.value = 0;
          progressTime = 0;
          isPlay.value = false;
        } else if (!isTriggerProgress) {
          currentTime.value = targetTime + progressTime;
        }
        // 回放视频流会出现时间不一致情况 如果临近视频结尾时暂停不动那就认为播放完毕
        clearTimeout(delayTimer);
        delayTimer = setTimeout(() => {
          if (timeLong - (targetTime + progressTime) <= 3000) {
            webRtcServer.disconnect();
            currentTime.value = 0;
            progressTime = 0;
            isPlay.value = false;
          }
        }, 1000);
      };

      return (
        <>
          <Progress
            isPlay={unref(isPlay)}
            timeLong={timeLong}
            onPlay={handleProgressPlay}
            onPause={handleProgressPause}
            onChangUp={handleProgressChangeUp}
            currentTime={unref(currentTime)}
            onTimeUpdate={handleProgressTimeUpdate}
          />
          <PlayVideo
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onTimeupdate={handleVideoTimeUpdate}
            onCreatdWebRtcServer={creatdWebRtcServer}
          />
        </>
      );
    };

    // 车内实时视频
    const carRealTime = function () {
      // 创建webRtc成功
      const creatdWebRtcServer = function (webRtc) {
        webRtcServer = webRtc;
        webRtcServer.connect(playUrl.value);
      };

      return <PlayVideo onCreatdWebRtcServer={creatdWebRtcServer} />;
    };

    const render = function () {
      return <>{isBackPlay.value ? playBack() : carRealTime()}</>;
    };

    expose({
      webGlPlayed
    });

    return () => render();
  }
});
</script>
