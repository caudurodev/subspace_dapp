<script setup lang="ts">
import { Identity } from '@subspace/subspace'
import { useUserStore } from '~/store/user'
import { getObject, pollIsObjectIdReachable, putObject } from '~/composables/useSubspace'

const fileData = ref()
const imageArr = ref([])
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
  isReadyForSharing.value = false
  if (e.target.files[0].type.includes('image/')) {
    if (e.target.files && e.target.files.length > 0)
      loadFile(e.target.files[0])
  }
  else {
    console.log('Please use an image file for this demo.')
  }
}

const getImage = async () => {
  if (!putImageId.value)
    return
  const imgData = await getObject(putImageId.value)
  if (imgData)
    imageArr.value.push(imgData)
}

const getIdentity = async () => {
  console.log('get identity')
  const identity = await Identity.fromWeb3()
  let name = ''
  identity.getKeyring().getPairs().map((account) => {
    name = account.meta.name.toUpperCase()
  })
  userStore.setUserName(name)
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
  <div class="w-full justify-start flex flex-col items-center">
    <div py-8>
      <h1 text-4xl font-900 text-gray-700>
        Subspace Mega Image Share
        <div class="i-logos-vue text-orange-400" />
      </h1>
      <h2 text-xl py-2>
        Upload any image to start sharing on the blockchain!
      </h2>
    </div>

    <div class="action-box">
      <h3>
        <Transition name="fade">
          <span v-if="user" text-white inline-block mr-2><div i="carbon-checkmark-filled inline-block" /></span>
        </Transition>
        Step 1 - connect your Polkadot Wallet
      </h3>
      <WalletConnection :user="user" @get-identity="getIdentity" @disconnect-wallet="userStore.setUserName('')" />
    </div>

    <Transition name="slide-fade">
      <div v-if="user" class="action-box">
        <h3 text-lg mt-2 mb-3>
          <Transition name="fade">
            <span v-if="putImageId" text-white inline-block mr-2><div i="carbon-checkmark-filled inline-block" /></span>
          </Transition>
          Step 2 - Choose an image to store on the blockchain
        </h3>
        <label class="custom-file-upload">
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
          <Transition name="fade">
            <span v-if="isObjectReacheable" text-white inline-block mr-2><div i="carbon-checkmark-filled inline-block" /></span>
          </Transition>
          <div v-if="!isReadyForSharing">
            Step 3 - Waiting for image to be available on the blockchain (can take a few minutes)<div v-if="!isObjectReacheable" i-carbon-circle-dash animate-spin text-5xl />
          </div>
          <div v-if="isReadyForSharing">
            Step 3 - Done!
            <RouterLink :to="`/img/${putImageId}`">
              View image
            </RouterLink>
          </div>
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

