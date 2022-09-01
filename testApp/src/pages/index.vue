<script setup lang="ts">
import { Buffer } from 'buffer'
import { Identity, SubspaceClient } from '@subspace/subspace'
import { useUserStore } from '~/store/user'
// import { useTimeoutPoll } from '@vueuse/core'

const fileData = ref()
const imageArr = ref([])
const putImageId = ref()
const userStore = useUserStore()
const { user } = toRefs(userStore)

const putObject = async (fileData) => {
  const identity = await Identity.fromWeb3()
  const subspaceClient = await SubspaceClient.connect(
    identity,
    import.meta.env.VITE_NODE_WS_PROVIDER,
    import.meta.env.VITE_FARMER_WS_PROVIDER,
  )
  try {
    const objectId = await subspaceClient.putObject(fileData)
    putImageId.value = objectId
  }
  catch (e) {
    console.log('error put object', e)
  }
}

// const { isActive, pause, resume } = await useTimeoutPoll(async (objectId) => {
//   const identity = await Identity.fromWeb3()
//   const subspaceClient = await SubspaceClient.connect(
//     identity,
//     import.meta.env.VITE_NODE_WS_PROVIDER,
//     import.meta.env.VITE_FARMER_WS_PROVIDER,
//   )
//   try {
//     await subspaceClient.getObject(objectId)
//     return true
//   }
//   catch {
//     return false
//   }
// }, 1000)

const loadFile = (file) => {
  const reader = new FileReader()
  reader.onload = async () => {
    if (reader.result) {
      fileData.value = new Uint8Array(reader.result)
      putObject(fileData.value)
    }
  }
  reader.readAsArrayBuffer(file)
}

// Please, note: Archiving takes 100-120 blocks to complete, the object is not retrievable right away
const getObject = async () => {
  const identity = await Identity.fromWeb3()
  const subspaceClient = await SubspaceClient.connect(
    identity,
    import.meta.env.VITE_NODE_WS_PROVIDER,
    import.meta.env.VITE_FARMER_WS_PROVIDER,
  )
  try {
    const object = await subspaceClient.getObject(putImageId.value)
    imageArr.value.push(object)
  }
  catch (e) {
    console.log('error get object:', e)
  }
}

const dataToImage = (object) => {
  return `data:image/*;base64,${Buffer.from(object).toString('base64')}`
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
    </div>
    <div pb-12>
      <div i-carbon-circle-dash animate-spin text-5xl />
      Get Image
      <button btn @click="getObject">
        Get Image
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
