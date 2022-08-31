import { Identity, SubspaceClient } from '@subspace/subspace'
import { useTimeoutPoll } from '@vueuse/core'

export async function useConnectSubspace() {
  const identity = await Identity.fromWeb3()
  const subspaceClient = await SubspaceClient.connect(
    identity,
    import.meta.env.VITE_NODE_WS_PROVIDER,
    import.meta.env.VITE_FARMER_WS_PROVIDER,
  )
  return { subspaceClient }
}

export async function IsObjectIdReachable(objectId): boolean {
  const { subspaceClient } = useConnectSubspace()
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

export async function usePollUntillObjectIdReachable(objectId) {
  const { isActive, pause, resume } = await useTimeoutPoll(IsObjectIdReachable(objectId), 1000)
  return { isActive, pause, resume }
}
