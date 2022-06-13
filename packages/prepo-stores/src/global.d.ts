declare namespace ethereum {
  const isMetaMask: boolean | undefined
  const request: (data: { method: string; params: unknown }) => Promise<null>
}
