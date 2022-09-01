<script setup lang="ts">
interface Props {
  user: string | null
}
const props = withDefaults(defineProps<Props>(), {
  user: () => '',
})
const emit = defineEmits<{
  (e: 'getIdentity'): void
  (e: 'disconnectWallet'): void
}>()
const user = toRef(props, 'user')
</script>

<template>
  <button btn data-test="wallet-connect-btn" @click="user ? emit('disconnectWallet') : emit('getIdentity')">
    <span v-if="!user">Connect Wallet</span>
    <span v-if="user">Connected: <span data-test="wallet-username" text-bold>{{ user }}</span></span>
  </button>
</template>

