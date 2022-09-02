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
    <RouterLink to="/" class="btn py-3 my-3 w-50 bg-blue-400 text-white font-bold text-left ">
      <div i="carbon-arrow-left" inline-block />
      Upload Image
    </RouterLink>
    <div v-if="isGettingObject" i-carbon-circle-dash animate-spin text-5xl />
    <img :src="imageObject">
    <input type="text" :value="`http://127.0.0.1:3333/img/${props.id}`" p-4 bg-blue-400 text-white font-bold rounded-3xl my-4>
  </div>
</template>

