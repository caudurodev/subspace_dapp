<script setup lang="ts">
import { Identity, SubspaceClient } from '@subspace/subspace'
import { useUserStore } from '~/store/user'
import { dataToImage, getObject, pollIsObjectIdReachable, putObject } from '~/composables/useSubspace'
// import { useTimeoutPoll } from '@vueuse/core'

const fileData = ref()
const imageArr = ref([])
const isGettingObject = ref(false)
const isObjectReacheable = ref(false)
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
  if (e.target.files[0].type.includes('image/')) {
    if (e.target.files && e.target.files.length > 0)
      loadFile(e.target.files[0])
  }
  else {
    console.log('Please use an image file for this demo.')
  }
}
const getLabel = ({ address, meta }) => {
  return `${meta.name.toUpperCase()} | ${address}`
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
    console.log('account', account)
    console.log(getLabel(account))
    name = account.meta.name.toUpperCase()
  })
  userStore.setUserName(name)
}

watch(isObjectReacheable, async (newVal) => {
  if (newVal) {
    await getImage()
    isObjectReacheable.value = false
    isGettingObject.value = false
  }
})
</script>

<template>
  <div>
    <h1 text-4xl>
      Subspace Mega Image Share
      <div class="i-logos-vue text-orange-400" />
    </h1>
    <h2 text-xl py-2>
      Upload an image to start sharing
    </h2>
    <WalletConnection :user="user" @get-identity="getIdentity" @disconnect-wallet=" userStore.setUserName('')" />
    <div>
      <ul>
        <li v-for="(imgData, imgIndex) in imageArr" :key="imgIndex">
          <img :src="dataToImage(imgData)">
        </li>
      </ul>
    </div>
    <div py-8>
      Store Image
      <input
        id="file"
        data-test="upload-image-input"
        type="file"
        accept="image/*"
        @input="$event => storeImage($event)"
      >
    </div>
    <div>
      putImageId: <input v-model="putImageId" type="text" p-2 w-full>
      <br>
      isObjectReacheable:{{ isObjectReacheable }}
      <br>
      isGettingObject:{{ isGettingObject }}
      <br>
      <div v-if="isGettingObject && !isObjectReacheable">
        waiting for object to become available in chain...<div v-if="!isObjectReacheable" i-carbon-circle-dash animate-spin text-5xl />
      </div>
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
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
