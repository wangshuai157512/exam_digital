<script lang="jsx">
import { onMounted, ref, unref, onBeforeMount } from "vue";
import { examAreaTree } from "@/api/index";
import { useMessageChannel } from "@/hooks/useChannel";
import { examStore } from "@/store/modules/exam";
import { playStore } from "@/store/modules/play";
import { getWebRtcRtspUrl } from "@/config/webrtc/index";

export default defineComponent({
  setup() {
    const exam = examStore();

    const examId = unref(computed(() => exam.getExamId));

    const { webMessagePort, stringify } = useMessageChannel();

    const play = playStore();

    // const data = ref([
    //   {
    //     name: "车管所大楼",
    //     buildName: "ZhuTi01",
    //     floor: null,
    //     roomName: null,
    //     subRegion: [
    //       {
    //         name: "科目二候考室",
    //         buildName: "ZhuTi01",
    //         floor: 1,
    //         roomName: "KeErHouKaoShi"
    //       },
    //       {
    //         name: "监控中心",
    //         buildName: "ZhuTi01",
    //         floor: 2,
    //         roomName: "JianKongZhongXin"
    //       }
    //     ]
    //   },
    //   {
    //     name: "理论考试大楼",
    //     buildName: "ZhuTi02",
    //     floor: null,
    //     roomName: null,
    //     subRegion: [
    //       {
    //         name: "理论候考室",
    //         buildName: "ZhuTi02",
    //         floor: 1,
    //         roomName: "YiLouLiLunHouKaoShi"
    //       },
    //       {
    //         name: "理论自助考试区",
    //         buildName: "ZhuTi02",
    //         floor: 1,
    //         roomName: "LiLunZiZhuKaoShiQu"
    //       },
    //       {
    //         name: "C5考试区",
    //         buildName: "ZhuTi02",
    //         floor: 1,
    //         roomName: "CWuKaoShiQu"
    //       },
    //       {
    //         name: "理论考试区(二楼)",
    //         buildName: "ZhuTi02",
    //         floor: 2,
    //         roomName: "ErLouLiLunKaoShiQu"
    //       },
    //       {
    //         name: "理论考试区(三楼)",
    //         buildName: "ZhuTi02",
    //         floor: 3,
    //         roomName: "SanLouLiLunKaoShiQu"
    //       }
    //     ]
    //   },
    //   {
    //     name: "科目二考试场地",
    //     buildName: "init",
    //     floor: null,
    //     roomName: null,
    //     subRegion: []
    //   }
    // ]);
    const data = ref([]);
    onMounted(() => {
      examAreaTree(examId).then((res) => {
        if (res) {
          data.value = res;
        }
      });
    });

    // const handleChange = function ({ type, xmqym }) {
    //   webMessagePort.postMessage(
    //     stringify({
    //       type: "examArea",
    //       examType: type,
    //       number: xmqym
    //     })
    //   );
    // };

    const handleClick = (e) => {
      const { upRegion, floor, regionCode } = e;
      if (e.vidEquipmentRespDTO) {
        const { tdh, wldz, yhm, mm, sblx } = e.vidEquipmentRespDTO;
        const url = getWebRtcRtspUrl({ tdh, wldz, yhm, mm }, sblx);
        play.$patch({
          url,
          key: Date.now()
        });
      } else {
        play.$patch({
          url: null,
          key: Date.now()
        });
      }
      webMessagePort.postMessage(
        stringify({
          type: "examArea",
          buildName: upRegion,
          floor,
          roomName: regionCode
        })
      );
    };

    const renderItem = (item, t, obj) => {
      const row = {
        ...item,
        upRegion: item.upRegion || obj.upRegion
      };
      return (
        <div class="area-item">
          <span onClick={() => handleClick(row)} class={"area-item-" + t}>
            {item.name}
          </span>
          {renderTree(item.subRegion, t, item)}
        </div>
      );
    };

    const renderTree = (data, t = 0, obj = {}) => {
      if (!data) return;
      return data.map((item) => renderItem(item, t + 1, obj));
    };

    return () => <div class="area-container">{renderTree(data.value)}</div>;
  }
});
</script>

<style scoped lang="less">
.area-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  padding: 0 10px;
  .area-item {
    padding-left: 10px;
    color: white;
    span {
      margin-bottom: 4px;
      display: inline-block;
      cursor: pointer;
    }
  }
  .area-item-1 {
    font-size: 18px;
  }
  .area-item-2 {
    font-size: 16px;
  }
  .area-item-3 {
    font-size: 14px;
  }
}
</style>
