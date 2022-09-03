<script setup lang="ts">
// TODO:
// - handle cases when polkadot{js} extension is not present
// - handle connection errors

interface Props {
  userName: string | null
}
const props = withDefaults(defineProps<Props>(), {
  userName: () => null,
})
const emit = defineEmits<{
  (e: 'getIdentity'): void
  (e: 'disconnectWallet'): void
}>()
const userName = toRef(props, 'userName')
</script>

<template>
  <button class="action-btn" data-test="wallet-connect-btn" @click="userName ? emit('disconnectWallet') : emit('getIdentity')">
    <div i="carbon-wallet" inline-block align-middle mr-2 />
    <span v-if="!userName">Connect Wallet</span>
    <span v-if="userName">
      Connected:
      <span data-test="wallet-username" text-bold mr-2>{{ userName }}</span>
      <div i="carbon-close-filled" inline-block align-middle pl-2 />
    </span>
  </button>
</template>
