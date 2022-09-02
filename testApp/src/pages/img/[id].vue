<script setup lang="ts">
import { dataToImage, getObject } from '~/composables/useSubspace'
const props = defineProps<{ id: string }>()
const imageObject = ref()
const isGettingObject = ref(true)

onMounted(async () => {
  imageObject.value = dataToImage(await getObject(props.id))
  isGettingObject.value = false
})
</script>

<template>
  <div class="w-full flex flex-col ">
    <div v-if="isGettingObject" i-carbon-circle-dash animate-spin text-5xl />
    <RouterLink to="/" class="btn py-3 my-3 bg-blue-400 hover:bg-blue-600 text-white font-bold text-left ">
      <div i="carbon-arrow-left" inline-block />
      Upload another Image to Share
    </RouterLink>
    <img :src="imageObject">
    <h1 mt-4>
      Share this image:
    </h1>
    <input type="text" :value="`http://127.0.0.1:3333/img/${props.id}`" p-4 bg-blue-400 text-white font-bold rounded-3xl my-4>
  </div>
</template>

