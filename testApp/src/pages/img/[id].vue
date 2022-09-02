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
  <div>
    id:{{ props.id }}
    <div v-if="isGettingObject" i-carbon-circle-dash animate-spin text-5xl />
    <img :src="imageObject">
  </div>
</template>

