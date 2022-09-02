<script setup lang="ts">
import { Identity } from '@subspace/subspace'
import { useUserStore } from '~/store/user'
import { getObject, pollIsObjectIdReachable, putObject, stopPollingObjectIdReachable } from '~/composables/useSubspace'

const fileData = ref()
const fileName = ref('')
const imageArr = ref([])
const blockchainImageData = ref<Uint8Array | null>()
const isGettingObject = ref(false)
const isObjectReacheable = ref(false)
const isReadyForSharing = ref(false)
const putImageId = ref()
const userStore = useUserStore()
const { user } = toRefs(userStore)

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
  console.log('storeimage', e)
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
  console.log('get identity')
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
  fileName.value = ''
  putImageId.value = ''
  stopPollingObjectIdReachable()
  console.log('reset')
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
            <span v-if="user" text-white inline-block mr-2 text-2xl><div i="carbon-checkmark-filled inline-block" /></span>
          </Transition>
          Step 1 - connect your Polkadot Wallet
        </h3>
        <WalletConnection :user="user" @get-identity="getIdentity" @disconnect-wallet="userStore.setUserName('')" />
      </div>

      <Transition name="slide-fade">
        <div v-if="user" class="action-box">
          <h3 text-lg mt-2 mb-3>
            <Transition name="fade">
              <span v-if="putImageId" text-white inline-block mr-2 text-2xl><div i="carbon-checkmark-filled inline-block" /></span>
            </Transition>
            Step 2 - Choose an image to store on the blockchain
          </h3>
          <span v-if="fileName" @click="resetFileUpload">{{ fileName }}</span>
          <label v-if="!fileName" class="custom-file-upload">
            <input
              id="file"
              data-test="upload-image-input"
              type="file"
              accept="image/*"
              @input="$event => storeImage($event)"
            >
            Choose a File
          </label>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="putImageId" class="action-box">
          <h3 text-lg mt-2 mb-3>
            <div v-if="!isReadyForSharing" class="flex flex-col items-center">
              Step 3 - Wait for image to be available on the blockchain
              <small block text-grey-400>(can take a few minutes)</small>
              <div v-if="!isObjectReacheable" i-carbon-circle-dash animate-spin text-5xl block mt-8 text-white />
            </div>
            <Transition name="fade">
              <div v-if="isReadyForSharing">
                <span text-white inline-block mr-2><div i="carbon-checkmark-filled inline-block" /></span>
                Step 3 - Done!
                <br>
                <RouterLink block :to="`/img/${putImageId}`">
                  <span inline-block mr-2><div i="carbon-share inline-block" /></span> Click to share the image:
                </RouterLink>
                <RouterLink :to="`/img/${putImageId}`" mt-4 py-4>
                  <div
                    class="bg-center w-full h-32 bg-green-400 py-4"
                    :style="{ 'background-image': `url(${dataToImage(blockchainImageData)})` }"
                  />
                </RouterLink>
              </div>
            </Transition>
          </h3>
        </div>
      </Transition>

    <!-- <div>
      putImageId: <input v-model="putImageId" type="text" p-2 w-full>
      <br>
      isObjectReacheable:{{ isObjectReacheable }}
      <br>
      isGettingObject:{{ isGettingObject }}
      <br>

      <RouterLink :to="`/img/${putImageId}`">
        View
      </RouterLink>
    </div>
    <div pb-12>
      <div v-if="isGettingObject" i-carbon-circle-dash animate-spin text-5xl />
      Get Image
      <button btn :disabled="!putImageId" @click="getImage">
        Get Image
      </button>
    </div>
    <div>
      <ul>
        <li v-for="(imgData, imgIndex) in imageArr" :key="imgIndex">
          <img :src="dataToImage(imgData)">
        </li>
      </ul>
    </div> -->
    </div>
  </div>
</template>

<style setup>
  .action-box{
    @apply my-2 bg-blue-200 p-4 rounded-3xl w-2/3;
  }
  .action-box h3{
    @apply text-lg py-2 text-gray-600 font-700
  }
  input[type="file"] {
    display: none;
  }
  .custom-file-upload {
    @apply btn bg-blue-500 py-2 px-6 my-4 rounded-xl hover:bg-blue-700;
    cursor: pointer;
}
</style>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<route lang="yaml">
meta:
  layout: home
</route>

