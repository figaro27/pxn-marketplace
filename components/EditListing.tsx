import React, { useContext, useState } from 'react'
import { WalletContext } from '../contexts/WalletContext'
import { ListingsContext } from './Listings'
import Modal from 'react-modal'
import axios from 'axios'
import { IListing } from '../interfaces/listings'
import { id } from 'ethers/lib/utils'

Modal.setAppElement('#__next')

type AddListingProps = {
  listing: IListing | null
  isOpen: boolean
  onClose: () => void
}
declare var window: any

const EditListing: React.FC<AddListingProps> = ({ listing, isOpen, onClose}) => {
  const { account } = useContext(WalletContext)
  const { setListings } = useContext(ListingsContext)
  const [image, setImage] = useState(listing ? listing.image : '')
  const [name, setName] = useState(listing ? listing.name : '')
  const [desc, setDesc] = useState(listing ? listing.desc : '')
  const [price, setPrice] = useState<number | undefined>(listing ? listing.price : undefined)

  const handleSubmit = async () => {
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
        name,
        desc,
        image,
        price,
      },
      primaryType: 'Product',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        Product: [
          { name: 'name', type: 'string' },
          { name: 'desc', type: 'string' },
          { name: 'image', type: 'string' },
          { name: 'price', type: 'uint256' },
        ],
      },
    };
    try {
      const from = account
      const sign = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });

      const { data: res } = await axios.post("/api/listings",
        {
          name,
          desc,
          image,
          price,
          creator: account,
          signature: sign
        }
      )
      setListings(res)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
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
        id: listing?.id,
        msg: `Delete ${listing?.name}`
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

      const { data: res} = await axios.delete('/api/listings',
        {
          data: {
            id: listing?.id,
            msg: `Delete ${listing?.name}`,
            address: account,
            signature: sign
          }
        }
      )
      setListings(res)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async () => {
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
        id: listing?.id,
        name,
        desc,
        image,
        price,
      },
      primaryType: 'Product',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        Product: [
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'desc', type: 'string' },
          { name: 'image', type: 'string' },
          { name: 'price', type: 'uint256' },
        ],
      },
    };
    try {
      const from = account
      const sign = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });

      const { data: res } = await axios.put("/api/listings",
        {
          isFavorite: false,
          id: listing?.id,
          name,
          desc,
          image,
          price,
          creator: account,
          signature: sign
        }
      )
      setListings(res)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className='modal'
    >
      <div className='w-full flex flex-col'>
        <label className='text-xl font-bold my-2'>
          {listing ? 'Edit Item' : 'Add New'}
        </label>
        <div className='flex items-center space-x-1 my-2'>
          <label className='w-24'>Name: </label>
          <input
            type='text'
            className='flex-1 border rounded p-1'
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />
        </div>
        <div className='flex items-center space-x-1 my-2'>
          <label className='w-24'>Image URL: </label>
          <input
            type='text'
            className='flex-1 border rounded p-1'
            value={image}
            onChange={(e: any) => setImage(e.target.value)}
          />
        </div>
        <img 
          src={image}
          className='w-64 h-64 mx-auto rounded my-2'
        />
        <div className='flex items-start space-x-1 my-2'>
          <label className='w-24'>Description: </label>
          <textarea 
            className='flex-1 border rounded p-1'
            value={desc}
            onChange={(e: any) => setDesc(e.target.value)}
          />
        </div>
        <div className='flex items-center space-x-1 my-2'>
          <label className='w-24'>Price(USD): </label>
          <input
            type='number'
            className='flex-1 border rounded p-1'
            value={price}
            onChange={(e: any) => setPrice(parseFloat(e.target.value))}
          />
        </div>
        {listing 
          ? <div className='flex justify-between'>
              <button
                className='w-32 bg-green-400 rounded-lg  p-2 text-white text-lg mt-2'
                onClick={() => handleUpdate()}
              >
                Update
              </button>
              <button 
                className='w-32 bg-red-400 rounded-lg  p-2 text-white text-lg mt-2'
                onClick={() => handleDelete()}
              >
                Delete
              </button>
            </div>
          : <button
              className='bg-blue-400 rounded-lg  p-2 text-white text-lg mt-2'
              onClick={() => handleSubmit()}
            > 
              Create
            </button>
        }
      </div>
    </Modal>
  )
}

export default EditListing