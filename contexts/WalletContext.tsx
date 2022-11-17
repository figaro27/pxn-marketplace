import React, { createContext, useState, useEffect } from 'react'
import { IWalletContext } from '../interfaces/wallet'

const defaultWallet = {
  account: null,
  connectWallet: () => {}
}

type Props = {
  children?: React.ReactNode
}

declare var window: any

export const WalletContext = createContext<IWalletContext>(defaultWallet)

export const WalletContextProvider: React.FC<Props> = ({ children }) => {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    const storage = localStorage.getItem('account')
    if (storage) setAccount(storage)    
  })

  const connectWallet = async () => {
    if (!window.ethereum) return
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (addressArray.length > 0) {
        setAccount(addressArray[0])
        localStorage.setItem('account', addressArray[0])
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        connectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}