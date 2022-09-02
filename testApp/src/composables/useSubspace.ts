import { Buffer } from 'buffer'
import { Identity, SubspaceClient } from '@subspace/subspace'
import type { Ref } from 'vue'

let web3Identity: Identity | null = null
let subspaceClient: SubspaceClient | null = null

export const connectSubspaceClient = async () => {
  if (web3Identity && subspaceClient) {
    console.log('connectSubspaceClient', web3Identity, subspaceClient)
    return subspaceClient
  }
  else {
    console.log('connectSubspaceClient...')
  }
  web3Identity = await Identity.fromWeb3()
  subspaceClient = await SubspaceClient.connect(
    web3Identity,
    import.meta.env.VITE_NODE_WS_PROVIDER,
    import.meta.env.VITE_FARMER_WS_PROVIDER,
  )
  console.log('connectSubspaceClient:', subspaceClient)
  return subspaceClient
}

export const IsObjectIdReachable = async (objectId: string): boolean => {
  await connectSubspaceClient()
  let isReachable = false
  try {
    await subspaceClient.getObject(objectId)
    isReachable = true
  }
  catch (e) {
    isReachable = false
  }

  return isReachable
}

// Please, note: Archiving takes 100-120 blocks to complete, the object is not retrievable right away
export const getObject = async (objectId: string) => {
  await connectSubspaceClient()
  try {
    return await subspaceClient.getObject(objectId)
  }
  catch (e) {
    console.log('error get object:', e)
  }
}

export const putObject = async (fileData) => {
  await connectSubspaceClient()
  try {
    const objectId = await subspaceClient.putObject(fileData)
    return objectId
  }
  catch (e) {
    console.log('error put object', e)
  }
}

let pollInterval: ReturnType<typeof setInterval>
export const pollIsObjectIdReachable = (objectId: string, isReachable: Ref) => {
  clearInterval(pollInterval)
  pollInterval = setInterval(async () => {
    const object = await getObject(objectId)
    if (object) {
      isReachable.value = true
      clearInterval(pollInterval)
    }
    else {
      isReachable.value = false
    }
  }, 2000)
}

export const dataToImage = (object) => {
  return `data:image/*;base64,${Buffer.from(object).toString('base64')}`
}
