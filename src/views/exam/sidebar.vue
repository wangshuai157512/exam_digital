<script lang="jsx">
import { defineComponent, ref, unref } from "vue";
import shousuo from "~/image/shousuo.png";
// import zhankai from "~/image/zhankai.png";
import silderM from "~/image/silder-m.png";

export default defineComponent({
  setup(props, { slots }) {
    const isOpen = ref(true);

    const handleClick = () => {
      isOpen.value = !unref(isOpen);
    };

    return () => (
      <div
        style={{
          transform: `translateX(${unref(isOpen) ? "20px" : "-100%"})`
        }}
        class="sidebar position-relative top-6%"
      >
        <img class="mc" src={silderM} />
        <img
          onClick={handleClick}
          style={{
            right: unref(isOpen) ? "-15px" : "-30px",
            transform: unref(isOpen) ? "rotate(180deg)" : "rotate(0deg)",
            transition: unref(isOpen) ? "none" : "transform 0.23s"
          }}
          class="o position-absolute top-0 bottom-0 m-auto cursor-pointer  z-100"
          src={shousuo}
          alt=""
        />
        {slots.default?.()}
      </div>
    );
  }
});
</script>

<style scoped lang="less">
.sidebar {
  // width: 380px;
  aspect-ratio: 438/977;
  height: calc(94% - 20px);
  box-sizing: border-box;
  padding: 10px 20px 10px 10px;
  min-width: 380px;
  z-index: 99;
  // background: #2f495f9c;
  transition: all 0.23s;
  // background: #2e425d;
  // background: linear-gradient(to right, #ff0000, #ffff00);
  background-image: url("~/image/silder.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  .o {
    width: 30px;
    // height: 60px;

    background-size: 100% 100%;
    background-repeat: no-repeat;
    right: -15px;
    transition: transform 0.23s;
  }

  .mc {
    position: absolute;
    width: 100%;
    height: calc(100% - 20px);
    border-radius: 4px;
  }
}
</style>
