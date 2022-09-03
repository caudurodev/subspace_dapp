<script setup lang="ts">
import { Identity } from '@subspace/subspace'
import { useUserStore } from '~/store/user'
import { getObject, pollIsObjectIdReachable, putObject, stopPollingObjectIdReachable } from '~/composables/useSubspace'

const userStore = useUserStore()
const { user } = toRefs(userStore)

const fileData = ref()
const fileName = ref('')
const imageArr = ref([])
const blockchainImageData = ref<Uint8Array | null>()
const isGettingObject = ref(false)
const isObjectReacheable = ref(false)
const isReadyForSharing = ref(false)
const isImageChosen = ref(false)
const putImageId = ref()

const loadFile = (file) => {
  const reader = new FileReader()
  reader.onload = async () => {
    if (reader.result) {
      isGettingObject.value = true
      fileData.value = new Uint8Array(reader.result)
      const objectId: string = await putObject(fileData.value)
      if (objectId) {
        putImageId.value = objectId
        pollIsObjectIdReachable(objectId, isObjectReacheable)
      }
    }
  }
  reader.readAsArrayBuffer(file)
}

const storeImage = (e) => {
  isImageChosen.value = true
  isReadyForSharing.value = false
  if (e.target.files[0].type.includes('image/')) {
    if (e.target.files && e.target.files.length > 0) {
      loadFile(e.target.files[0])
      fileName.value = e.target.files[0].name
    }
  }
  else {
    // TODO:
    // - visually display message to user
    console.log('Please use an image file for this demo.')
  }
}

const getImage = async () => {
  if (!putImageId.value)
    return
  const imgData = await getObject(putImageId.value)
  if (imgData) {
    blockchainImageData.value = imgData
    imageArr.value.push(imgData)
  }
}

const getIdentity = async () => {
  const identity = await Identity.fromWeb3()
  if (identity) {
    let name = ''
    identity.getKeyring().getPairs().map((account) => {
      name = account.meta.name.toUpperCase()
    })
    userStore.setUserName(name)
  }
  else {
    // TODO - handle visually
    console.log('error getting identity')
  }
}

const resetFileUpload = () => {
  isImageChosen.value = false
  fileName.value = ''
  putImageId.value = ''
  stopPollingObjectIdReachable()
}

watch(isObjectReacheable, async (newVal) => {
  if (newVal) {
    await getImage()
    isReadyForSharing.value = true
    isObjectReacheable.value = false
    isGettingObject.value = false
  }
})
</script>

<template>
  <div>
    <div class="w-full justify-start flex flex-col items-center">
      <div class="action-box">
        <h3>
          <Transition name="fade">
            <span v-if="user" class="status-icon"><div i="carbon-checkmark-filled inline-block" /></span>
          </Transition>
          <b>Step 1 -</b> Connect your Polkadot Wallet
        </h3>
        <WalletConnection :user="user" @get-identity="getIdentity" @disconnect-wallet="userStore.setUserName('')" />
      </div>

      <Transition name="slide-fade">
        <div v-if="user" class="action-box">
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
              @input="$event => storeImage($event)"
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
                <RouterLink block :to="`/img/${putImageId}`">
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
  @apply my-2 bg-blue-200 p-6 rounded-3xl w-2/3;
}
.action-box h3{
  @apply text-lg py-2 text-gray-600 font-700
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

