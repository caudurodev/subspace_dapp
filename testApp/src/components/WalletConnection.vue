<script setup lang="ts">
// TODO:
// - handle cases when polkadot{js} extension is not present
// - handle connection errors

interface Props {
  user: string | null
}
const props = withDefaults(defineProps<Props>(), {
  user: () => null,
})
const emit = defineEmits<{
  (e: 'getIdentity'): void
  (e: 'disconnectWallet'): void
}>()
const user = toRef(props, 'user')
</script>

<template>
  <button class="action-btn" data-test="wallet-connect-btn" @click="user ? emit('disconnectWallet') : emit('getIdentity')">
    <div i="carbon-wallet" inline-block align-middle mr-2 />
    <span v-if="!user">Connect Wallet</span>
    <span v-if="user">
      Connected:
      <span data-test="wallet-username" text-bold mr-2>{{ user }}</span>
      <div i="carbon-close-filled" inline-block align-middle pl-2 />
    </span>
  </button>
</template>
