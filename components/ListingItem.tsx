import React, { useState, useContext, useCallback, useMemo } from 'react'
import { IListing } from '../interfaces/listings'
import Image from 'next/image'
import { WalletContext } from '../contexts/WalletContext'
import { ListingsContext } from './Listings'
import uesEthPrice from '../hooks/useEthPrice'
import EditListing from './EditListing'
import axios from 'axios'
import StarGold from '../public/images/star-gold.png'
import StarGray from '../public/images/star-gray.png'

type ListingItemProps = {
  listing: IListing
}

declare var window: any

const ListingItem: React.FC<ListingItemProps> = ({ listing }) => {
  const [showDetail, setShowDetail] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const { account } = useContext(WalletContext)
  const { setListings } = useContext(ListingsContext)
  const ethPrice = uesEthPrice()
  const [showEdit, setShowEdit] = useState(false)

  const handleFavorite  = useCallback(async (e: any) => {
    e.stopPropagation();
    if (!account) {
      alert("Please connect wallet!")
      return
    }
    const msgParams = {
      domain: {
        name: 'PXN',
        version: 'test'
      },
      message: {
        id: listing.id,
        msg: `Update favorite for ${listing.name}`
      },
      primaryType: 'Product',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        Product: [
          { name: 'id', type: 'string' },
          { name: 'msg', type: 'string' },
        ],
      },
    };
    try {
      const from = account
      const sign = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });

      const { data: res} = await axios.put('/api/listings',
        {
          id: listing.id,
          isFavorite: true,
          msg: `Update favorite for ${listing.name}`,
          address: account,
          signature: sign
        }
      )
      setListings(res)
    } catch (err) {
      console.error(err)
    }
  }, [account])

  const handleListingClick = (e: any) => {
    setShowDetail(!showDetail)
  }

  const isFavorited = useMemo(() => {
    const favorites = listing.favorites
    const idx = favorites.findIndex(fav => fav === account)
    return idx === -1 ? false : true
  }, [account, listing])
 
  return (
    <div className='border-b py-2'>
      <div 
        className='flex items-center justify-between cursor-pointer'
        onClick={handleListingClick}
      >
        <div className='flex items-center space-x-2'>
          <img 
            src={listing.image}
            className='w-16 h-16 rounded-lg'
            alt={listing.name}
          />
          <div className='flex flex-col'>
            <span className='text-lg font-bold'>
              {listing.name}
            </span>
            <span>
              {listing.creator?.slice(0, 5)}...{listing.creator?.slice(38)}
            </span>
            <div className='flex items-center space-x-2'>
              <Image 
                src={StarGold} 
                width={15}
                height={15}
                alt="favorites"
                />
              <span>
                {listing.favorites.length}
              </span>
            </div>
          </div>
        </div>
        <div className='flex items-center space-x-8'>
          <span className='text-lg font-semibold'>
            {ethPrice && (listing.price / ethPrice).toFixed(4)} ETH
          </span>
          <Image 
            src={isFavorited ? StarGold : StarGray} 
            width={30}
            height={30}
            className='cursor-pointer'
            onClick={handleFavorite}
            alt="favorite"
          />
        </div>
      </div>
      {showDetail &&
        <div className='my-2 flex flex-col sm:flex-row space-y-4 sm:space-x-6'>
          <img 
            src={listing.image}
            className='w-72 h-72 rounded-lg'
            alt={listing.name}
          />
          <div className='flex flex-col'>
            <label className='text-3xl font-bold'>
              {listing.name}
            </label>
            <label className='text-lg font-semibold'>
              Creator: {listing.creator}
            </label>
            <label className='text-lg font-semibold'>
              Price: {ethPrice && (listing.price / ethPrice).toFixed(4)}ETH {`(${listing.price}USD)`} 
            </label>
            <label className='text-lg font-semibold'>
              {`Created: ${new Date(listing.createdAt).toDateString()}`}
            </label>
            <p>
              {listing.desc}
            </p>
            <div className='flex items-center space-x-2 text-lg'>
              <Image 
                src={StarGold} 
                width={20}
                height={20}
                alt="favorites"
                />
              <span>
                {listing.favorites.length}
              </span>

              {showFavorites
                ? <button className='text-red-400 underline' onClick={() => setShowFavorites(false)}>
                    hide favorites
                  </button>
                : <button className='text-blue-400 underline' onClick={() => setShowFavorites(true)}>
                    show favorites
                  </button>
              }

            </div>

            {showFavorites && listing.favorites.map((favorite, idx) => 
              <label key={idx} className="mx-2">
                {favorite}
              </label>
            )}

            {account && listing.creator === account &&
              <button 
                className='border py-1 w-32 rounded mt-4'
                onClick={() => setShowEdit(true)}
              >
                Edit
              </button>
            }
            {showEdit &&
              <EditListing
                listing={listing}
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
              />
            }
          </div>
        </div>
      }

    </div>

  )
}

export default ListingItem