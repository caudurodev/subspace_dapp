import { Identity, SubspaceClient } from '@subspace/subspace'

export async function useSubspace() {
  const identity = await Identity.fromWeb3()
  const subspaceClient = await SubspaceClient.connect(
    identity,
    import.meta.env.VITE_NODE_WS_PROVIDER,
    import.meta.env.VITE_FARMER_WS_PROVIDER,
  )
  return { subspaceClient }
}
