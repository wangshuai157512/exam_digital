<script setup></script>
<template>
  <div>
    <div class="shadow-top"></div>
    <div class="shadow-right"></div>
    <div class="shadow-bottom"></div>
    <div class="shadow-left"></div>
  </div>
</template>
<style scoped lang="less">
.shadow-top,
.shadow-bottom {
  width: 100%;
  height: 150px;
  position: absolute;
  z-index: 98;
}
.shadow-left,
.shadow-right {
  width: 150px;
  height: 100%;
  position: absolute;
  z-index: 98;
  top: 0;
  bottom: 0;
  margin: auto;
}
.shadow-top {
  top: -150px;
  left: 0;
  box-shadow: 0px 80px 150px 0 #04203a;
}
.shadow-right {
  right: -150px;
  box-shadow: -80px 0 150px 0 #04203a;
}
.shadow-left {
  left: -150px;
  box-shadow: 80px 0 150px 0 #04203a;
}
.shadow-bottom {
  bottom: -150px;
  left: 0;
  box-shadow: 0px -80px 150px 0 #04203a;
}
</style>
