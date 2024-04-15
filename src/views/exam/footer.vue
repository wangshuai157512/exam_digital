<script lang="jsx">
import { defineComponent, ref, unref } from "vue";
import { useBlackStatus } from "../exam/sidecontent/hooks/useBlack";
import { useMessageChannel } from "@/hooks/useChannel";

const isTrackPlayback = location.href.includes("trackPlayback");

export default defineComponent({
  props: {
    modelValue: {
      type: Number
    }
  },
  setup({ modelValue }, { emit }) {
    const menu = [
      "考场首页",
      "考试区域",
      "考试项目",
      "考试车辆",
      "考生人员",
      "监控设备"
    ];
    const count = ref(modelValue);
    const { back } = useBlackStatus();

    const types = [
      "mainInterface",
      "examArea",
      "examProject",
      "examCar",
      "examPersonal",
      "monitoringEquipment"
    ];

    const { webMessagePort, stringify } = useMessageChannel();
    const change = function (index) {
      if (index !== 5) {
        webMessagePort.postMessage(
          // 3d 初始化模型
          stringify({
            type: "main",
            category: types[index]
          })
        );
      }
      emit("update:modelValue", (count.value = index));
      back();
    };

    const btnClass = `menu w-18% h-100% flex flex-justify-center
                      flex-items-center color-white font-700
                      cursor-pointer`;

    const footClass = `w-55% h-5% position-absolute bottom-20px
                       m-auto left-0 right-0 flex flex-justify-between z-99 flex-items-center`;

    const buttonItem = function () {
      return menu.map((item, index) => {
        return (
          <div
            className={
              unref(count) === index
                ? `${btnClass} font-size-6 active`
                : btnClass
            }
            onClick={() => {
              change(index);
            }}
          >
            {item}
          </div>
        );
      });
    };

    // 轨迹回放隐藏下面按钮
    if (isTrackPlayback) {
      return () => <div></div>;
    }

    return () => <footer className={footClass}>{buttonItem()}</footer>;
  }
});
</script>

<style scoped lang="less">
.menu {
  background-image: url("~/image/tab-t.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position-y: center;
}

.active {
  width: 22%;
  height: 112%;
  background-image: url("~/image/tab-s.png");
}
</style>
