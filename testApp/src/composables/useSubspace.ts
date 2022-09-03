import { Buffer } from 'buffer'
import { Identity, SubspaceClient } from '@subspace/subspace'
import type { Ref } from 'vue'

let web3Identity: Identity | null = null
let subspaceClient: SubspaceClient | null = null

export const getConnectedSubspaceClient = async (): Promise<SubspaceClient | null> => {
  if (web3Identity && subspaceClient)
    return subspaceClient

  web3Identity = await Identity.fromWeb3()
  subspaceClient = await SubspaceClient.connect(
    web3Identity,
    import.meta.env.VITE_NODE_WS_PROVIDER,
    import.meta.env.VITE_FARMER_WS_PROVIDER,
  )
  return subspaceClient
}

// Please, note: Archiving takes 100-120 blocks to complete, the object is not retrievable right away
export const getObject = async (objectId: string) => {
  await getConnectedSubspaceClient()
  try {
    return await subspaceClient.getObject(objectId)
  }
  catch (e) {
    // TODO: handle errors
    // console.log('error get object:', e)
  }
}

export const putObject = async (fileData: Uint8Array): Promise<string | null> => {
  await getConnectedSubspaceClient()
  try {
    const objectId = await subspaceClient.putObject(fileData)
    return objectId
  }
  catch (e) {
    return null
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

export const stopPollingObjectIdReachable = () => {
  clearInterval(pollInterval)
}

export const dataToImage = (fileData: Uint8Array): string => {
  return `data:image/*;base64,${Buffer.from(fileData).toString('base64')}`
}
