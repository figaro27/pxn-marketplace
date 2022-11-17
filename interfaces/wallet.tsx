export interface IWalletContext {
  account: string | null
  connectWallet: () => void
}