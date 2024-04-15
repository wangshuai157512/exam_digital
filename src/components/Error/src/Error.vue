<script setup>
import pageError from "@/assets/svgs/404.svg";
</script>

<style>
img {
  display: block;
  margin: 20px auto;
}
</style>

<template>
  <div class="flex justify-center">
    <div class="text-center">
      <img width="750" :src="pageError" alt="" />
    </div>
  </div>
</template>
