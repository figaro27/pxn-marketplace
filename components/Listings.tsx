import React, { useEffect, useState, useContext, createContext } from 'react'
import axios from 'axios'
import { IListing } from '../interfaces/listings'
import EditListing from './EditListing'
import { WalletContext } from '../contexts/WalletContext'
import ListingItem from './ListingItem'
import SearchInput from './SearchInput'

export const ListingsContext = createContext<{
  listings: IListing[] | undefined
  setListings: any
}>({
  listings: [],
  setListings: () => {}
})

const Listings: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>()
  const [showAddNew, setShowAddNew] = useState(false)
  const { account, connectWallet } = useContext(WalletContext)

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get(`/api/listings`)
      setListings(data)
    }
    getData()
  }, [])

  return (
    <ListingsContext.Provider value={{listings, setListings}}>
      <div className='px-2'>
        <div className='flex flex-col md:flex-row justify-between items-end my-8'>
          <label className='w-full md:w-auto text-xl md:text-4xl font-bold px-4'>
            PxN Marketplace
          </label>
          <div className='flex flex-col sm:flex-row items-end sm:items-center space-x-2'>
            {account && 
              <button 
                className='text-blue-500'
                onClick={() => setShowAddNew(true)}
              >
                + Add New
              </button>
            }
            <SearchInput />
            <div className='p-1 md:px-4 md:py-2 rounded border rounded-lg cursor-pointer'>
              {account
                ? <label>
                    {account?.slice(0, 5)}...{account?.slice(38)}
                  </label>
                : <button 
                    onClick={() => connectWallet()}
                  >
                    connect wallet
                  </button>
              }
            </div>
            {showAddNew &&
              <EditListing
                listing={null}
                isOpen={showAddNew}
                onClose={() => setShowAddNew(false)}
              />
            }
          </div>

        </div>
        <div className='flex flex-col space-y-2'>
          {listings?.map((listing, idx) =>
            <ListingItem listing={listing} key={idx} />
          )}
        </div>
      </div>
    </ListingsContext.Provider>
  )
}

export default Listings