<script setup lang="ts">
// TODO:
// - handle cases when polkadot{js} is not present
// - handle connection errors

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
  <button class="action-btn" data-test="wallet-connect-btn" @click="user ? emit('disconnectWallet') : emit('getIdentity')">
    <span v-if="!user">Connect Wallet</span>
    <span v-if="user">Connected: <span data-test="wallet-username" text-bold>{{ user }}</span></span>
  </button>
</template>

<style>
.action-btn{
    @apply btn bg-blue-500 py-2 px-6 my-4 rounded-xl hover:bg-blue-700;
}
</style>
