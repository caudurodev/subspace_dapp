<script setup lang="ts">
import { Buffer } from 'buffer'
import { Identity, SubspaceClient } from '@subspace/subspace'

const fileData = ref()
const imageArr = ref([])
const putImageId = ref()

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
</script>

<template>
  <div>
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
        type="file"
        accept="image/*"
        @input="$event => storeImage($event)"
      >
    </div>
    <div>
      putImageId: {{ putImageId }}
    </div>
    <div pb-12>
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
