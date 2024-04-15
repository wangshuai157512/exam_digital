<script setup>
import { useBlackStatus } from "../hooks/useBlack";
const { transFormStyle } = useBlackStatus();
</script>
<template>
  <div class="container">
    <div :style="transFormStyle" class="tran w-200%">
      <slot></slot>
    </div>
  </div>
</template>
<style scoped lang="less">
.tran {
  transition: all 0.18s;
}
</style>
