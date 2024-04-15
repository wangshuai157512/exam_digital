<script lang="jsx">
import { watch, effect, nextTick } from "vue";
import { Close } from "@element-plus/icons-vue";
import warning from "~/image/warning.png";
import { warnStore } from "@/store/modules/warn";
import { modalStore } from "@/store/modules/modal";
import { useMessageChannel } from "@/hooks/useChannel";

const modal = modalStore();

const warn = warnStore();

export default defineComponent({
  setup() {
    const transform = function (num) {
      const { width } = window.screen;
      const message = document.getElementById("warn_message");
      const messageWidth = message.offsetWidth;
      const left = (width - messageWidth) / 2;

      message.style.transform = `translateY(${num}px)`;
      message.style.left = `${left}px`;
    };

    const warnInfo = computed(() => warn.getwarnInfo);

    watch(
      warnInfo.value,
      (v) => {
        transform(20);
        setTimeout(() => {
          transform(-200);
        }, 5000);
      },
      { flush: "post" }
    );

    // 关闭
    const handleClick = function (event) {
      transform(-200);
      event.stopPropagation();
    };

    const { addModalSet, setModalParam } = modal;

    // 查看详情
    const handleWarnDetails = function () {
      addModalSet(0);
      setModalParam(warnInfo.value);
    };

    const { webMessagePort, stringify } = useMessageChannel();

    webMessagePort.onmessage = function (msg) {
      const { type, data } = msg.data;
      if (type === "warn") {
        addModalSet(0);
        setModalParam(data);
      }
    };

    const renderwarnLeve = function (leve = 1) {
      if (leve === 1) {
        return <span class="warn-leve bg-#FF0000">一级</span>;
      } else if (leve === 2) {
        return <span class="warn-leve bg-#F09609">二级</span>;
      } else {
        return <span class="warn-leve bg-#DEDE00">三级</span>;
      }
    };

    const renderwarnInfo = function (info) {
      if (Object.keys(info).length) {
        return (
          <>
            <span class="font-size-14px m-l-8px">{info.yjjx}</span>
            <span class="font-size-12px m-l-8px m-r-8px">
              {info.yjsj.split(" ")[1]}
            </span>
            {renderwarnLeve(info.yjsjdj)}
          </>
        );
      }
    };

    return () => (
      <>
        <div id="warn_top" class="warn-top"></div>
        <div id="warn_right" class="warn-right"></div>
        <div id="warn_bottom" class="warn-bottom"></div>
        <div id="warn_left" class="warn-left"></div>
        <div onClick={handleWarnDetails} id="warn_message">
          <div class="color-white">
            <img src={warning} />
            {renderwarnInfo(warnInfo.value)}
          </div>
          <el-icon onClick={handleClick} color="white" size="20">
            <Close />
          </el-icon>
        </div>
      </>
    );
  }
});
</script>
<style scoped lang="less">
#warn_message {
  transform: translateY(-200px);
  height: 40px;
  padding: 0 6px;
  border: 1px red solid;
  background: rgba(255, 0, 0, 0.219);
  top: 60px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.3s;
  z-index: 1000;
  position: absolute;
  cursor: pointer;
  img {
    width: 20px;
    height: 20px;
  }
  :deep(.el-icon) {
    cursor: pointer;
  }
  .warn-leve {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
  }
}
.warn-top,
.warn-bottom {
  width: 100%;
  height: 50px;
  position: absolute;
  z-index: 999;
}
.warn-left,
.warn-right {
  width: 50px;
  height: 100%;
  position: absolute;
  z-index: 999;
  top: 0;
  bottom: 0;
  margin: auto;
}
.warn-top {
  top: -50px;
  left: 0;
}
.warn-right {
  right: -50px;
}
.warn-left {
  left: -50px;
}
.warn-bottom {
  bottom: -50px;
  left: 0;
}
</style>
