<script setup lang="ts">
import { Identity } from '@subspace/subspace'
import { useUserStore } from '~/store/user'
import { getObject, pollIsObjectIdReachable, putObject, stopPollingObjectIdReachable } from '~/composables/useSubspace'

const userStore = useUserStore()
const { userName } = toRefs(userStore)

const fileData = ref()
const fileName = ref('')
const blockchainImageData = ref<Uint8Array | null>()
const isGettingObject = ref(false)
const isObjectReacheable = ref(false)
const isReadyForSharing = ref(false)
const isImageChosen = ref(false)
const putImageId = ref()

const loadFileIntoBlockchain = (file: File) => {
  const reader = new FileReader()
  reader.onload = async () => {
    if (reader.result) {
      isGettingObject.value = true
      fileData.value = new Uint8Array(reader.result)
      const objectId = await putObject(fileData.value)
      if (objectId) {
        putImageId.value = objectId
        pollIsObjectIdReachable(objectId, isObjectReacheable)
      }
    }
  }
  reader.readAsArrayBuffer(file)
}

const storeImageInBlockchain = (e: Event) => {
  isImageChosen.value = true
  isReadyForSharing.value = false
  const target = e.target as HTMLInputElement
  if (target?.files[0]?.type?.includes('image/')) {
    if (target.files && target.files.length > 0) {
      loadFileIntoBlockchain(target.files[0])
      fileName.value = target.files[0].name
    }
  }
  else {
    // TODO:
    // - Display error message to user
  }
}

const getImageFromBlockchain = async () => {
  if (!putImageId.value)
    return
  const imgData = await getObject(putImageId.value)
  if (imgData)
    blockchainImageData.value = imgData
}

const getPolkadotIdentity = async () => {
  const identity: Identity = await Identity.fromWeb3()
  const userName: string = identity
    ? identity.getKeyring().getPairs().map((account) => {
      return account.meta.name
    })[0]
    : null
  if (userName)
    userStore.setUserName(userName)
}

const resetFileUpload = () => {
  isImageChosen.value = false
  fileName.value = ''
  putImageId.value = ''
  stopPollingObjectIdReachable()
}

watch(isObjectReacheable, async (newVal) => {
  if (newVal) {
    await getImageFromBlockchain()
    isReadyForSharing.value = true
    isGettingObject.value = false
    isObjectReacheable.value = false
  }
})
</script>

<template>
  <div>
    <div class="w-full justify-start flex flex-col items-center">
      <div class="action-box">
        <h3>
          <Transition name="fade">
            <span v-if="userName" class="status-icon"><div i="carbon-checkmark-filled inline-block" /></span>
          </Transition>
          <b>Step 1 -</b> Connect your Polkadot Wallet
        </h3>
        <WalletConnection :user-name="userName" @get-identity="getPolkadotIdentity" @disconnect-wallet="userStore.setUserName('');resetFileUpload()" />
      </div>

      <Transition name="slide-fade">
        <div v-if="userName" class="action-box z-10">
          <h3 text-lg mt-2 mb-3>
            <Transition name="fade">
              <span v-if="isImageChosen" class="status-icon"><div i="carbon-checkmark-filled inline-block" /></span>
            </Transition>
            <b>Step 2 -</b> Choose an image to store on the blockchain
          </h3>
          <label v-if="!fileName" class="action-btn mt-2 mb-3 inline-block">
            <input
              id="file"
              data-test="upload-image-input"
              type="file"
              accept="image/*"
              @input="$event => storeImageInBlockchain($event)"
            >
            <div i="carbon-image" inline-block align-middle mr-2 />
            Choose an Image
          </label>
          <button v-if="fileName" class="action-btn mt-2 mb-3" @click="resetFileUpload">
            <div i="carbon-image" inline-block align-middle mr-2 />
            {{ fileName }}
            <div i="carbon-close-filled" inline-block align-middle pl-2 />
          </button>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="isImageChosen" class="action-box">
          <h3 text-lg mt-2 mb-3>
            <Transition name="fade">
              <span v-if="putImageId" class="status-icon"><div i="carbon-checkmark-filled inline-block" /></span>
            </Transition>
            <b>Step 3 -</b> Sign Transaction and Upload image to blockchain.
            <div v-if="!putImageId" w-full flex items-center justify-center>
              <div i-carbon-circle-dash animate-spin text-5xl mt-8 text-white />
            </div>
          </h3>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="putImageId" class="action-box">
          <h3 text-lg mt-2 mb-3>
            <Transition name="fade">
              <span v-if="isReadyForSharing" class="status-icon"><div i="carbon-checkmark-filled inline-block" /></span>
            </Transition>
            <span v-if="!isObjectReacheable && !isReadyForSharing">
              <b>Step 4 -</b>
              Please wait for image to be available on the blockchain
              <small block text-grey-400>(can take a few minutes)</small>
              <div w-full flex items-center justify-center>
                <div i-carbon-circle-dash animate-spin text-5xl mt-8 text-white />
              </div>
            </span>
            <span v-if="isReadyForSharing"><b>Step 4 -</b> Done!</span>
            <Transition name="fade">
              <div v-if="isReadyForSharing" py-4>
                <RouterLink block :to="`/img/${putImageId}`" data-test="image-share-btn">
                  <span mr-2 py-4 block><div i="carbon-share" inline-block /> Click to share the image:</span>
                </RouterLink>
                <RouterLink :to="`/img/${putImageId}`" mt-4 py-4>
                  <div
                    class="bg-center w-full h-64 bg-green-400 pt-10 py-8 block rounded-3xl"
                    :style="{ 'background-image': `url(${dataToImage(blockchainImageData)})` }"
                  />
                </RouterLink>
              </div>
            </Transition>
          </h3>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style setup>
.action-box{
  @apply my-2 bg-blue-200 p-6 rounded-3xl w-2/3 shadow-xl  border-2 border-blue-300/30 dark:bg-gray-900;
}
.action-box h3{
  @apply text-lg py-2 text-gray-600 font-700 dark:text-gray-200;
}
.status-icon{
  @apply text-white inline-block mr-2 text-2xl align-middle;
}
input[type="file"] {
  display: none;
}
</style>

<route lang="yaml">
meta:
  layout: home
</route>

