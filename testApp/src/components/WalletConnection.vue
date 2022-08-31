<script setup lang="ts">
interface Props {
  user: string | null
}
const props = withDefaults(defineProps<Props>(), {
  user: () => '',
})
const emit = defineEmits<{
  (e: 'getIdentity'): void
}>()
const user = toRef(props, 'user')
</script>

<template>
  <button btn @click="emit('getIdentity')">
    Connect Polkadot Wallet {{ user }}
  </button>
</template>

