<script setup>
const isTrackPlayback = location.href.includes("trackPlayback");
const src = `/digitalTwin/${isTrackPlayback ? "Track" : "WuYao"}.html`;
</script>
<template>
  <iframe id="WuYao" :src="src" frameborder="0"></iframe>
</template>
<style scoped lang="less">
#WuYao {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}
</style>
